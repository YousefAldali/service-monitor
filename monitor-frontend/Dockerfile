# Stage 1: Build the React app
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve with Nginx: that is optimized for production
FROM nginx:alpine

# Copy the build output to Nginx and this is a multi-stage build it means that the Dockerfile has 2 or more stages
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf 
# Expose port 80 for the frontend server
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 