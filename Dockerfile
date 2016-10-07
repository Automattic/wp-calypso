FROM       node:6.9.0-slim
MAINTAINER Automattic

WORKDIR    /calypso

# includes three key files plus everything else
#   - env-config.sh
#      used by systems to overwrite some defaults
#      such as the apt and npm mirrors
#
#   - package.json
#      provides the build scripts needed by npm
#
#   - npm-shrinkwrap.json
#      provides the actual node dependencies for the project
COPY       . /calypso

ENV        NODE_PATH=/calypso/server:/calypso/client

RUN        true \
           && mv ./env-config.sh /tmp/env-config.sh \
           && bash /tmp/env-config.sh \
           && apt-get -y update \
           && apt-get -y install \
                 git \
                 make \
           # Sometimes "npm install" fails the first time when the
           # cache is empty, so we retry once if it failed
           && npm install --production || npm install --production \
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
