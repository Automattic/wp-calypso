ARG use_cache=false
ARG node_version=20.8.1
ARG base_image=registry.a8c.com/calypso/base:latest

###################
FROM node:${node_version}-bullseye-slim as builder-cache-false


###################
# This image contains a directory /calypso/.cache which includes caches
# for yarn, terser, css-loader and babel.
FROM ${base_image} as builder-cache-true

ENV NPM_CONFIG_CACHE=/calypso/.cache
ENV PERSISTENT_CACHE=true

ARG generate_cache_image=false
ENV GENERATE_CACHE_IMAGE $generate_cache_image

###################
FROM builder-cache-${use_cache} as builder

# Make sure shell options, like pipefail, are set for the build.
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

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
ENV PLAYWRIGHT_SKIP_DOWNLOAD true
ENV SKIP_TSC true
ENV NODE_OPTIONS --max-old-space-size=$node_memory
ENV IS_CI=true
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
COPY . /calypso/
RUN yarn install --immutable --check-cache --inline-builds
RUN node --version && yarn --version && npm --version

# Build the final layer
#
# This contains built environments of Calypso. It will
# change any time any of the Calypso source-code changes.
ENV NODE_ENV production
RUN yarn run build 2>&1 | tee /tmp/build_log.txt

# This will output a service message to TeamCity if the build cache was invalidated as seen in the build_log file.
RUN ./bin/check-log-for-cache-invalidation.sh /tmp/build_log.txt

# Delete any sourcemaps which may have been generated to avoid creating a large artifact.
RUN find /calypso/build /calypso/public -name "*.*.map" -exec rm {} \;

###################
# A cache-only update can be generated with "docker build --target update-base-cache"
FROM ${base_image} as update-base-cache

# Update webpack cache in the base image so that it can be re-used in future builds.
# We only copy this part of the cache to make --push faster, and because webpack
# is the main thing which will impact build performance when the cache invalidates.
COPY --from=builder /calypso/.cache/evergreen/webpack /calypso/.cache/evergreen/webpack

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
