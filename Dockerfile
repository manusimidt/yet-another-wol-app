ARG NODE_VERSION=24.7.0-alpine

# Stage 1: Build the backend application
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

# Copy package files for dependency installation
COPY backend/package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source code and TypeScript config
COPY backend/tsconfig.json ./
COPY backend/src ./src

# Build the TypeScript application
RUN npm run build

# Stage 2: Production runtime
FROM node:${NODE_VERSION} AS runner

WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/

# Install only production dependencies
RUN npm ci --omit=dev --prefix ./backend

# Copy built application from builder stage
COPY --from=builder /app/dist ./backend/dist

# Copy frontend (one file hehe)
COPY frontend/ ./frontend/

# Expose the application port
EXPOSE 3210

# Run the application
CMD ["node", "backend/dist/index.js"]
