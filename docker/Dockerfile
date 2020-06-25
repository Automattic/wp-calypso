#### builder image
FROM node:12.16.2 as builder
LABEL stage=builder

ARG node_memory=8192
WORKDIR /calypso
ENV YARN_CACHE_FOLDER=/calypso/.yarn-cache
ENV NVM_DIR=/calypso/.nvm
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=$node_memory
# Install bash, used for building FSE

RUN git clone https://github.com/nvm-sh/nvm.git "$NVM_DIR" \
	&& git -C "$NVM_DIR" checkout v0.35.3

COPY . ./src

# We run `nvm.sh` outside ./src so it doesn't try to use node version specified in `.nvmrc` before installing it.
RUN . "$NVM_DIR/nvm.sh" \
	&& cd ./src \
	&& nvm install \
	&& nvm use \
	&& yarn

ENTRYPOINT [ "/bin/bash" ]

#### ci image
FROM node:12.16.2 as ci
LABEL stage=ci

ARG node_memory=8192
ARG UID=1003

WORKDIR /calypso
ENV YARN_CACHE_FOLDER=/calypso/.yarn-cache
ENV NVM_DIR=/calypso/.nvm
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=$node_memory

RUN chown $UID /calypso
COPY --from=builder --chown=$UID /calypso/.yarn-cache /calypso/.yarn-cache
COPY --from=builder --chown=$UID /calypso/.nvm /calypso/.nvm
