FROM node:12.18.0 as builder
LABEL maintainer="Automattic"

WORKDIR /calypso


ENV CONTAINER 'docker'
ENV PROGRESS=true

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
COPY ./env-config.sh /tmp/env-config.sh
RUN bash /tmp/env-config.sh

# Build a "source" layer
#
# This layer is populated with up-to-date files from
# Calypso development.
COPY . /calypso/
RUN yarn install --frozen-lockfile


# Build the final layer
#
# This contains built environments of Calypso. It will
# change any time any of the Calypso source-code changes.
ARG commit_sha="(unknown)"
ENV COMMIT_SHA $commit_sha

ARG workers
RUN WORKERS=$workers CALYPSO_ENV=production BUILD_TRANSLATION_CHUNKS=true yarn run build


FROM node:12.18.0-alpine as app

ARG commit_sha="(unknown)"
ENV COMMIT_SHA=$commit_sha
ENV NODE_ENV=production
WORKDIR /calypso
RUN apk add --no-cache tini
COPY --from=builder --chown=nobody:nobody /calypso/node_modules /calypso/node_modules/
COPY --from=builder --chown=nobody:nobody /calypso/packages /calypso/packages/
COPY --from=builder --chown=nobody:nobody /calypso/config /calypso/config/
COPY --from=builder --chown=nobody:nobody /calypso/client/node_modules /calypso/client/node_modules/
COPY --from=builder --chown=nobody:nobody /calypso/client/server/devdocs/search-index.js /calypso/client/server/devdocs/
COPY --from=builder --chown=nobody:nobody /calypso/client/server/bundler/*.json /calypso/client/server/bundler/
COPY --from=builder --chown=nobody:nobody /calypso/client/webpack.config.js /calypso/client/
COPY --from=builder --chown=nobody:nobody /calypso/build /calypso/build/
COPY --from=builder --chown=nobody:nobody /calypso/public /calypso/public/

USER nobody
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "build/server.js"]
