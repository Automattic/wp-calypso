FROM node:12.18.0
LABEL maintainer="Automattic"

WORKDIR    /calypso


ENV        CONTAINER 'docker'
ENV        PROGRESS=true

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

# Build a "source" layer
#
# This layer is populated with up-to-date files from
# Calypso development.
COPY . /calypso/
RUN yarn install --frozen-lockfile && yarn cache clean


# Build the final layer
#
# This contains built environments of Calypso. It will
# change any time any of the Calypso source-code changes.
ARG        commit_sha="(unknown)"
ENV        COMMIT_SHA $commit_sha

ARG        workers
RUN        WORKERS=$workers CALYPSO_ENV=production BUILD_TRANSLATION_CHUNKS=true yarn run build && rm -fr .cache

USER       nobody
CMD        NODE_ENV=production node build/server.js
