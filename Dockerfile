FROM node

WORKDIR /src

# Copy package files and install dependencies first (caching)
COPY client/package*.json ./
RUN npm install

# Copy the rest of your app
COPY client/ ./

EXPOSE 5173

ENTRYPOINT ["npm","run","dev","--","--host"]
