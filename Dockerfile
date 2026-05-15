FROM node:20-alpine

WORKDIR /app

# The static server (server.js) has zero runtime dependencies, so no
# npm install is needed. Everything not excluded by .dockerignore is
# copied: the static pages, assets/, images/, package.json (so Node
# treats server.js as ESM via "type":"module") and server.js itself.
COPY . .

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
