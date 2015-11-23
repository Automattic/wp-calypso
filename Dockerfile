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
RUN     wget https://nodejs.org/dist/v0.12.6/node-v0.12.6-linux-x64.tar.gz && \
          tar -zxf node-v0.12.6-linux-x64.tar.gz -C /usr/local && \
          ln -sf node-v0.12.6-linux-x64 /usr/local/node && \
          ln -sf /usr/local/node/bin/npm /usr/local/bin/ && \
          ln -sf /usr/local/node/bin/node /usr/local/bin/ && \
          rm node-v0.12.6-linux-x64.tar.gz

ENV     NODE_PATH /calypso/server:/calypso/shared

# Install base npm packages to take advantage of the docker cache
COPY    ./package.json /calypso/package.json
RUN     npm install --production

COPY     . /calypso

# Build javascript bundles for each environment and change ownership
RUN     CALYPSO_ENV=wpcalypso make build-wpcalypso && \
          CALYPSO_ENV=horizon make build-horizon && \
          CALYPSO_ENV=stage make build-stage && \
          CALYPSO_ENV=production make build-production && \
          chown -R nobody /calypso

USER    nobody
CMD     NODE_ENV=production node build/bundle-$CALYPSO_ENV.js
