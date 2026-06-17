FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src/

RUN npm run build

COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 3000

CMD ["./start.sh"]
