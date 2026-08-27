# Use the official Node.js 22
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port 4000 for the backend server
EXPOSE 4000

# Start the backend server
CMD ["node", "server.js"]
