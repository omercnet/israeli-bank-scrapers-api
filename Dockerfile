FROM node:alpine

ENV PORT 3000

WORKDIR /usr/src/app

RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD [ "node", "server.js" ]