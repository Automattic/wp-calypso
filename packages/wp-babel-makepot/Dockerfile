FROM node:24.22.1

# /src is where we expect the source files to extract strings from
RUN mkdir /src

# `cwd`/build/ is the default output location
RUN mkdir /build

# Copy + install packages
COPY ./package.json /
COPY ./package-lock.json /
COPY ./index.js /
COPY ./cli.js /
COPY ./process-files.js /
COPY ./worker.js /
COPY ./utils/ /utils/
RUN npm install

# /src is user code lives, /build is pot file output
VOLUME /src /build

# Entrypoint runs wp-babel-makepot with required params
ENTRYPOINT npm start "src/**/*.js{,x}" -- --ignore "**/node_modules/**,**/*.spec.js,**/*.test.js"
