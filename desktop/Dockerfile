FROM debian:latest

ARG NODE_VERSION=12.19.1

# prepare .ssh dir
RUN mkdir -p /root/.ssh/
COPY id_rsa /root/.ssh/id_rsa

WORKDIR /usr/src/wp-calypso

# replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# update the repository sources list
# and install dependencies
RUN apt-get update \
    && apt-get install -y git curl build-essential \
    && apt-get -y autoclean

# nvm environment variables
ENV NVM_DIR /usr/local/nvm

# install nvm
# https://github.com/creationix/nvm#install-script
RUN curl --silent -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.2/install.sh | bash

# install node and npm
RUN source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default \
    && npm install -g yarn

# add node and npm to path so the commands are available
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# confirm installation
RUN node -v
RUN npm -v

EXPOSE 3000

CMD /bin/bash
