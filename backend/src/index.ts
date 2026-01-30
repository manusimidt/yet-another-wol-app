import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import fs from "fs";
import yaml from "js-yaml";
import morgan from "morgan";
import path from "path";
import wol from "wake_on_lan";

if (process.env.NODE_ENV == "development") {
  // Load environment variables from .env file
  dotenv.config();
}

// Type definitions
interface Server {
  name: string;
  mac: string;
  ip?: string;
  broadcast?: string;
}

interface SecurityConfig {
  pin_required: boolean;
}

interface Config {
  servers: Server[];
  security?: SecurityConfig;
}

interface WakeRequestBody {
  pin?: string;
}

interface WolOptions {
  address?: string;
}

// Load configuration
const CONFIG_PATH = process.env.CONFIG_PATH || path.join(__dirname, "./servers.yaml");
let config: Config;

try {
  const fileContents = fs.readFileSync(CONFIG_PATH, "utf8");
  config = yaml.load(fileContents) as Config;
} catch (error) {
  console.error("Error loading configuration file:", (error as Error).message);
  process.exit(1);
}

// Validate configuration
if (!config.servers || !Array.isArray(config.servers) || config.servers.length === 0) {
  console.error('ERROR: Configuration must contain a "servers" array with at least one server');
  process.exit(1);
}

// Validate each server
config.servers.forEach((server, index) => {
  if (!server.name || typeof server.name !== "string") {
    console.error(`ERROR: Server at index ${index} missing required field: name`);
    process.exit(1);
  }
  if (!server.mac || typeof server.mac !== "string") {
    console.error(`ERROR: Server at index ${index} missing required field: mac`);
    process.exit(1);
  }
  // Validate MAC address format
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  if (!macRegex.test(server.mac)) {
    console.error(`ERROR: Server "${server.name}" has invalid MAC address format: ${server.mac}`);
    process.exit(1);
  }
});

// Validate PIN requirement
if (config.security && config.security.pin_required) {
  const globalPin = process.env.WOL_GLOBAL_PIN;
  if (!globalPin) {
    console.error("ERROR: PIN is required but WOL_GLOBAL_PIN environment variable is not set!");
    console.error("Please set WOL_GLOBAL_PIN environment variable and restart the application.");
    process.exit(1);
  }
  console.log("PIN security enabled");
} else {
  console.log("PIN security disabled");
}

const app = express();
const PORT = 3210; // todo env variable in the future

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Serve frontend
app.use(express.static(path.join(__dirname, "../../frontend")));

// Get server list
app.get("/api/servers", (_req: Request, res: Response) => {
  const serverList = config.servers.map((server) => ({
    name: server.name,
    ip: server.ip,
  }));

  res.json({
    servers: serverList,
    pinRequired: config.security ? config.security.pin_required : false,
  });
});

// Wake server
app.post("/api/wake/:serverName", (req: Request<{ serverName: string }, unknown, WakeRequestBody>, res: Response) => {
  const { serverName } = req.params;
  const { pin } = req.body;

  // Validate PIN first if required (before checking server existence to prevent enumeration)
  if (config.security && config.security.pin_required) {
    const globalPin = process.env.WOL_GLOBAL_PIN;
    if (pin !== globalPin) {
      res.status(403).json({ error: "Invalid PIN or server not found" });
      return;
    }
  }

  // Find server
  const server = config.servers.find((s) => s.name === decodeURIComponent(serverName));
  if (!server) {
    res.status(404).json({ error: "Invalid PIN or server not found" });
    return;
  }

  // Send WOL packet
  const wolOptions: WolOptions = {};
  if (server.broadcast) {
    wolOptions.address = server.broadcast;
  }

  wol.wake(server.mac, wolOptions, (error: Error | null) => {
    if (error) {
      console.error(`Error waking ${server.name}:`, error);
      res.status(500).json({ error: "Failed to send WOL packet" });
      return;
    }

    console.log(`WOL packet sent to ${server.name} (${server.mac})`);
    res.json({ success: true, message: `WOL packet sent to ${server.name}` });
  });
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`WOL server running on port ${PORT}`);
  console.log(`Loaded ${config.servers.length} server(s) from configuration`);
});
