# Use exact Node version 22.16.0
FROM node:22.16.0-slim

# Install OpenSSL (required by Prisma engine)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests and Prisma schema first for efficient layer caching
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Run your build script: "prisma generate && tsc -p tsconfig.json"
RUN npm run build

# Expose port (matches PORT in environment or default 3000)
EXPOSE 5000

# Start production server: "node dist/server.js"
CMD ["npm", "run", "start"]