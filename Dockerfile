ARG use_cache=false
ARG node_version=18.13.0
ARG base_image=registry.a8c.com/calypso/base:latest

###################
FROM node:${node_version}-bullseye-slim as builder-cache-false


###################
# This image contains a directory /calypso/.cache which includes caches
# for yarn, terser, css-loader and babel.
FROM ${base_image} as builder-cache-true

ENV NPM_CONFIG_CACHE=/calypso/.cache
ENV PERSISTENT_CACHE=true
ENV READONLY_CACHE=true

###################
FROM builder-cache-${use_cache} as builder

# Information for Sentry Releases.
ARG manual_sentry_release=false
ARG is_default_branch=false
ARG sentry_auth_token=''
ENV MANUAL_SENTRY_RELEASE $manual_sentry_release
ENV IS_DEFAULT_BRANCH $is_default_branch
ENV SENTRY_AUTH_TOKEN $sentry_auth_token

ARG commit_sha="(unknown)"
ARG workers=4
ARG node_memory=8192
ENV CONTAINER 'docker'
ENV PROFILE=true
ENV COMMIT_SHA $commit_sha
ENV CALYPSO_ENV production
ENV WORKERS $workers
ENV BUILD_TRANSLATION_CHUNKS true
ENV PUPPETEER_SKIP_DOWNLOAD true
ENV PLAYWRIGHT_SKIP_DOWNLOAD true
ENV SKIP_TSC true
ENV NODE_OPTIONS --max-old-space-size=$node_memory
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
COPY ./env-config.sh /tmp/env-config.sh
RUN bash /tmp/env-config.sh

# Build a "source" layer
#
# This layer is populated with up-to-date files from
# Calypso development.
#
# We remove apps, tests and desktop because they are not needed to
# build or run calypso, but yarn will still install their
# dependencies which end up bloating the image.
# /apps/notifications is not removed because it is required by Calypso
COPY . /calypso/
RUN yarn install --immutable --check-cache

# Build the final layer
#
# This contains built environments of Calypso. It will
# change any time any of the Calypso source-code changes.
ENV NODE_ENV production
RUN yarn run build

# Delete any sourcemaps which may have been generated to avoid creating a large artifact.
RUN find /calypso/build /calypso/public -name "*.*.map" -exec rm {} \;

###################
FROM node:${node_version}-alpine as app

ARG commit_sha="(unknown)"
ENV COMMIT_SHA $commit_sha
ENV NODE_ENV production
WORKDIR /calypso

RUN apk add --no-cache tini
COPY --from=builder --chown=nobody:nobody /calypso/build /calypso/build
COPY --from=builder --chown=nobody:nobody /calypso/public /calypso/public
COPY --from=builder --chown=nobody:nobody /calypso/config /calypso/config
COPY --from=builder --chown=nobody:nobody /calypso/package.json /calypso/package.json

USER nobody
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "--unhandled-rejections=warn", "build/server.js"]
