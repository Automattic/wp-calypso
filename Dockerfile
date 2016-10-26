FROM	debian:wheezy

MAINTAINER Automattic

WORKDIR /calypso

RUN     mkdir -p /tmp
COPY    ./env-config.sh /tmp/
RUN     bash /tmp/env-config.sh
RUN     apt-get -y update && apt-get -y install \
          wget \
          git \
          python \
          make \
          build-essential

ENV NODE_VERSION 6.9.1

RUN     wget https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz && \
          tar -zxf node-v$NODE_VERSION-linux-x64.tar.gz -C /usr/local && \
          ln -sf /usr/local/node-v$NODE_VERSION-linux-x64 /usr/local/node && \
          ln -sf /usr/local/node/bin/npm /usr/local/bin/ && \
          ln -sf /usr/local/node/bin/node /usr/local/bin/ && \
          rm node-v$NODE_VERSION-linux-x64.tar.gz

# npmrc is created by env-config.sh. For local testing, an empty one is generated
RUN     touch /usr/local/etc/npmrc && \
          mkdir /usr/local/node/etc && \
          cp /usr/local/etc/npmrc /usr/local/node/etc/npmrc

ENV     NODE_PATH /calypso/server:/calypso/client

# Install base npm packages to take advantage of the docker cache
COPY    ./package.json /calypso/package.json
COPY    ./npm-shrinkwrap.json /calypso/npm-shrinkwrap.json
# Sometimes "npm install" fails the first time when the cache is empty, so we retry once if it failed
RUN     npm install --production || npm install --production

COPY     . /calypso

# Build javascript bundles for each environment and change ownership
RUN     CALYPSO_ENV=wpcalypso make build-wpcalypso && \
          CALYPSO_ENV=horizon make build-horizon && \
          CALYPSO_ENV=stage make build-stage && \
          CALYPSO_ENV=production make build-production && \
          chown -R nobody /calypso

USER    nobody
CMD     NODE_ENV=production node build/bundle-$CALYPSO_ENV.js
