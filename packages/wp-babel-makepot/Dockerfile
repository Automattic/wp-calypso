FROM node:12.20.1

# /src is where we expect source javascript to run our babel config over
RUN mkdir /src

# `cwd`/build/ is the default output location for @automattic/babel-plugin-i18n-calypso
RUN mkdir /build

# Copy + install packages
COPY ./package.json /
COPY ./package-lock.json /
COPY ./index.js /
COPY ./cli.js /
COPY ./presets/ /presets/
RUN npm install

# /src is user code lives, /build is pot file output
VOLUME /src /build

# Entrypoint runs wp-babel-makepot with required params
ENTRYPOINT npm start "src/**/*.js{,x}" -- --ignore "**/node_modules/**,**/*.spec.js,**/*.test.js"
