FROM node:22-alpine
WORKDIR /app
COPY server.js .
ENV STATE_DIR=/data PORT=8099
VOLUME ["/data"]
EXPOSE 8099
USER node
CMD ["node","server.js"]
