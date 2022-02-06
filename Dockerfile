FROM node:alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install dotenv
COPY . .
EXPOSE 8080
CMD [ "npm", "start" ]