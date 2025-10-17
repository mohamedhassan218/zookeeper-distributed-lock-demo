FROM node:22.14

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

CMD ["node", "server.js"]