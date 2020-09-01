#### builder image
FROM node:12.16.2 as builder
LABEL stage=builder

ARG node_memory=8192
WORKDIR /calypso
ENV YARN_CACHE_FOLDER=/calypso/.cache/yarn
ENV NPM_CONFIG_CACHE=/calypso/.cache
ENV NVM_DIR=/calypso/.nvm
ENV NODE_ENV=production
ENV CALYPSO_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=$node_memory
ENV CHROMEDRIVER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV HOME=/calypso

RUN git clone https://github.com/nvm-sh/nvm.git "$NVM_DIR" \
	&& git -C "$NVM_DIR" checkout v0.35.3

COPY . .

# Run nvm.sh in a different dir so it doesn't try to use the version specified in /calypso/.nvmrc. It will fail
# the docker image
RUN cd / \
	&& . "$NVM_DIR/nvm.sh" \
	&& cd $HOME \
	&& nvm install \
	&& nvm use \
	&& yarn \
	&& yarn build-client-both

ENTRYPOINT [ "/bin/bash" ]

#### ci image
FROM node:12.16.2 as ci
LABEL stage=ci

ARG node_memory=8192
ARG UID=1003

WORKDIR /calypso
ENV YARN_CACHE_FOLDER=/calypso/.cache/yarn
ENV NPM_CONFIG_CACHE=/calypso/.cache
ENV NVM_DIR=/calypso/.nvm
ENV NODE_ENV=production
ENV CALYPSO_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=$node_memory
ENV HOME=/calypso

RUN chown $UID /calypso
COPY --from=builder --chown=$UID /calypso/.nvm /calypso/.nvm
COPY --from=builder --chown=$UID /calypso/.cache /calypso/.cache
