FROM       node:6.9.0-slim
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
RUN        true \
           && bash /tmp/env-config.sh \
           && apt-get -y update \
           && apt-get -y install \
                 git \
                 make \
           && true

# Build a "dependencies" layer
#
# This layer should include all required npm modules
# and should only change as often as the dependencies
# change. This layer should allow for final build times
# to be limited only by the Calypso build speed.
#
# Sometimes "npm install" fails the first time when the
# cache is empty, so we retry once if it failed
COPY       ./package.json ./npm-shrinkwrap.json /calypso/
RUN        npm install --production || npm install --production

# Build the final layer
#
# This contains built environments of Calypso. It will
# change any time any of the Calypso source-code changes.
COPY       . /calypso/
RUN        true \
           && CALYPSO_ENV=wpcalypso make build-wpcalypso \
           && CALYPSO_ENV=horizon make build-horizon \
           && CALYPSO_ENV=stage make build-stage \
           && CALYPSO_ENV=production make build-production \
           && chown -R nobody /calypso \
           # Clean up the dependencies we no longer need
           && apt-get remove -y \
                 git \
           && apt-get autoremove -y \
           && rm -rf /var/lib/apt/lists/* \
           && rm -rf /var/lib/dpkg/info/* \
           && rm -rf /tmp/* \
           && rm -rf /var/tmp/* \
           && rm -rf /usr/share/{doc,doc-base,info,locale,man}/* \
           && rm -rf /root/.npm \
           && true

USER       nobody
CMD        NODE_ENV=production node build/bundle-$CALYPSO_ENV.js
