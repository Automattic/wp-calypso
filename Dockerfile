FROM    node:8.9.3 AS build
LABEL   maintainer="Automattic"
RUN     true \
        && mkdir /calypso \
        && useradd calypso -d /calypso \
        && chown calypso:calypso /calypso \
        && true
USER    calypso
WORKDIR /calypso

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
COPY --chown=calypso ./env-config.sh /tmp/env-config.sh
RUN  bash /tmp/env-config.sh && rm /tmp/env-config.sh

# Build a "dependencies" layer
#
# This layer should include all required npm modules
# and should only change as often as the dependencies
# change. This layer should allow for final build times
# to be limited only by the Calypso build speed.
COPY --chown=calypso ./package.json ./npm-shrinkwrap.json /calypso/
RUN  npm install --production

# Build a "source" layer
#
# This layer is populated with up-to-date files from
# Calypso development.
COPY --chown=calypso . /calypso/

# Build the application
#
# This contains built environments of Calypso. It will
# change any time any of the Calypso source-code changes.
ARG commit_sha='(unknown)'
ENV CALYPSO_ENV='production' \
    COMMIT_SHA=$commit_sha   \
    CONTAINER='docker'      \
    NODE_ENV='production'   \
    NODE_PATH='/calypso/server:/calypso/client'
RUN [ "npm", "run", "build" ]

# Build the application image
#
# Pull only the assets required to run Calypso into the final image.
FROM    node:8.9.3
RUN     true \
        && mkdir /calypso \
        && useradd calypso -d /calypso \
        && chown calypso:calypso /calypso \
        && true
USER    calypso
WORKDIR /calypso
COPY    --chown=calypso --from=build /calypso/.github      /calypso/.github
COPY    --chown=calypso --from=build /calypso/docs         /calypso/docs
COPY    --chown=calypso --from=build /calypso/config       /calypso/config
COPY    --chown=calypso --from=build /calypso/node_modules /calypso/node_modules
COPY    --chown=calypso --from=build /calypso/server       /calypso/server
COPY    --chown=calypso --from=build /calypso/public       /calypso/public
COPY    --chown=calypso --from=build /calypso/build        /calypso/build
ARG     commit_sha='(unknown)'
ENV     CALYPSO_ENV='production' \
        COMMIT_SHA=$commit_sha   \
        CONTAINER='docker'      \
        NODE_ENV='production'   \
        NODE_PATH='/calypso/server:/calypso/client'
CMD     [ "node", "build/bundle.js" ]
