FROM node:23-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=optional


FROM node:23-alpine
WORKDIR /app

# Create and use a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/node_modules ./node_modules
COPY public ./public
COPY views ./views
COPY server.js ./

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD curl --fail http://localhost:3000/healthz || exit 1

EXPOSE 3000
CMD ["node", "server.js"]