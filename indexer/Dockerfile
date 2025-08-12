# Use official Bun image (has Bun, Node, and npm)
FROM oven/bun:1.1

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml if you use pnpm
COPY package.json pnpm-lock.yaml* ./

# Install dependencies using pnpm
RUN bun install

# Copy the rest of the project
COPY . .

ENTRYPOINT ["bun", "/app/src/main.ts"]
CMD []
