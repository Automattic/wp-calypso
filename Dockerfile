FROM       node:8.9.1
MAINTAINER Automattic

WORKDIR    /calypso


ENV        NODE_PATH=/calypso/server:/calypso/client

# Build a "base" layer
#
# This layer should never change unless env-config.sh
# changes. For local development this should always
# be an empty file and therefore this layer should
# cache well.
#
# env-config.sh
#   used by systems to overwrite some defaults
#   such as the apt and npm mirrors
COPY       ./env-config.sh /tmp/env-config.sh
RUN        bash /tmp/env-config.sh

# Build a "dependencies" layer
#
# This layer should include all required npm modules
# and should only change as often as the dependencies
# change. This layer should allow for final build times
# to be limited only by the Calypso build speed.
COPY       ./package.json ./npm-shrinkwrap.json /calypso/
RUN        true \
           && npm install --production \
           && rm -rf /root/.npm \
           && true

# Build the final layer
#
# This contains built environments of Calypso. It will
# change any time any of the Calypso source-code changes.
COPY       . /calypso/
RUN        true \
           && CALYPSO_ENV=production npm run build \
           && chown -R nobody /calypso \
           && true

USER       nobody
CMD        NODE_ENV=production node build/bundle.js
