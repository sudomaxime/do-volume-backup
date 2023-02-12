## Stage 1 (production base)
# This gets our prod dependencies installed and out of the way
FROM node:16.16.0-slim as base

EXPOSE 4000

ENV NODE_ENV=production

WORKDIR /node

COPY package.json package-lock*.json ./

RUN npm ci \
  && npm cache clean --force

## Stage 2 (development) -----------------------------------------------

FROM base as dev

ENV NODE_ENV=development

ENV PATH=/node/node_modules/.bin:$PATH

RUN npm install --only=development

WORKDIR /node/app

ENTRYPOINT ["ts-node", "./src/index.ts"]

## Stage 3 (copy in source for prod) -------------------------------------
FROM base as prod

WORKDIR /node/app

COPY . .

RUN ../node_modules/.bin/tsc --project /node/app/tsconfig.json

RUN chmod +x ./dist/index.js

# Example if you need email templates
# COPY ./src/templates ./dist/templates

ENTRYPOINT ["./run.sh"]
CMD ["--help"]