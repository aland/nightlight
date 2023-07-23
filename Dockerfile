FROM node:20.3.1-alpine3.17

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY app.js .
EXPOSE 3000
CMD [ "node", "app.js" ]
