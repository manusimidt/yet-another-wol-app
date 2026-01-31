# Yet Another WOL Webapp

## Features
- Fancy UI 🌟
- Mobile friendly 📱
- Optionally set a PIN to enter before sending a Wake-on-LAN packet 🔐
- Configure servers easily via a YAML file
- Easy deployment via `docker-compose.yaml`
- Build for Raspberry PI (should work on any Linux server)

## Inspiration
Electricity in Germany is quite expensive 🥲 and of course, shutting down your homelab servers to save energy is always 
a good thing for the environment 🌍. 
Therefore, in my current homelab, I have an always-on Raspberry Pi which I use to host this web app. Using a VPN tunnel, I 
can access `YAWAPP` and easily power on my servers via my phone

## Deploy 
## 1. Create a servers.yaml file
```shell
nano servers.yaml
```
```yaml
security:
  pin_required: true

servers:
  - name: "TrueNas Server"
    ip: "192.168.178.xx"
    mac: "AA:BB:CC:DD:EE:01"
    broadcast: "192.168.178.255"
  - name: "Proxmox Server"
    ip: "192.168.178.xx"
    mac: "AA:BB:CC:DD:EE:02"
    broadcast: "192.168.178.255"
```
## 2. Optionally create .env file
```shell
nano .env
```
```
YAWAPP_PIN=1234
```

## 3. Create the docker-compose file
```shell
nano docker-compose.yaml
```
```yaml
services:
  yawapp:
    image: manusimidt/yawapp:latest
    restart: unless-stopped
    network_mode: host # IMPORTANT, without it WOL packets won't reach anything outside the docker host
    volumes:
      - ./servers.yaml:/app/config/servers.yaml:ro
    env_file: .env
```

## 4. Start it up 🥳
```shell
docker compose up -d
```

## 5. Optionally: Support me 🥺
- Star this repo 🌟
- If you are really happy, [buy me a coffee](https://buymeacoffee.com/manusimidt)
