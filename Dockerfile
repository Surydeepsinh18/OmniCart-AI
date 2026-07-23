# Dockerfile for OmniCart AI Backend & Frontend Web Application
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package definition files
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy application source code
COPY . .

# Expose port
EXPOSE 3001

# Environment variables
ENV PORT=3001

# Start server
CMD ["npm", "start"]
