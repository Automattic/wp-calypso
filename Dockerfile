# syntax=docker/dockerfile:1.20

ARG cache_mode=seed
ARG node_version=22.9.0
ARG cache_seed_image=registry.a8c.com/calypso/cache-seed:latest

###################
FROM node:${node_version}-bullseye-slim AS builder-cache-none

WORKDIR /calypso
ENV HOME=/calypso
ENV NPM_CONFIG_CACHE=/calypso/.cache
ENV PERSISTENT_CACHE=true

RUN mkdir -p /calypso/.cache /calypso/.yarn

###################
FROM ${cache_seed_image} AS cache-seed-source

###################
FROM node:${node_version}-bullseye-slim AS builder-cache-seed

WORKDIR /calypso
ENV HOME=/calypso
ENV NPM_CONFIG_CACHE=/calypso/.cache
ENV PERSISTENT_CACHE=true

COPY --from=cache-seed-source /calypso/.cache /calypso/.cache
COPY --from=cache-seed-source /calypso/.yarn /calypso/.yarn

###################
# Dedicated dependency-install stage.
# By copying only manifests and the lockfile first, we can cache
# the slow yarn install and skip it when only source files change.
FROM builder-cache-${cache_mode} AS deps

WORKDIR /calypso
ENV PLAYWRIGHT_SKIP_DOWNLOAD=true
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV SKIP_TSC=true
ENV SKIP_CALYPSO_POSTINSTALL=true
ENV SKIP_CALYPSO_PACKAGE_BUILDS=true
ENV CONTAINER=docker
ENV IS_CI=true

# For Sentry uploads
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
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

# Copy dependency metadata only — manifests, lockfile, and Yarn config.
# The workspace COPY block below should stay in sync with the root
# workspaces in package.json. A CI check (`yarn check:docker-workspace-copy-globs`)
# will let you know if they drift apart.
COPY ./package.json ./yarn.lock ./.yarnrc.yml /calypso/
COPY ./.yarn/releases /calypso/.yarn/releases
COPY ./.yarn/patches /calypso/.yarn/patches
# BEGIN: workspace package manifests (must stay in sync with package.json workspaces)
COPY --parents \
  ./apps/*/package.json \
  ./packages/*/package.json \
  ./client/package.json \
  ./desktop/package.json \
  ./test/e2e/package.json \
  /calypso/
# END: workspace package manifests

# We don't need the full postinstall (build-packages, husky) at this
# stage — just the bare install. SKIP_CALYPSO_POSTINSTALL lets us
# bypass it safely.
COPY ./bin/postinstall.sh /calypso/bin/postinstall.sh
RUN yarn install --immutable --check-cache --inline-builds

###################
FROM deps AS builder

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
ARG profile=false
ENV CONTAINER 'docker'
ENV PROFILE=$profile
ENV COMMIT_SHA $commit_sha
ENV CALYPSO_ENV production
ENV WORKERS $workers
ENV BUILD_TRANSLATION_CHUNKS true
ENV NODE_OPTIONS --max-old-space-size=$node_memory
ENV IS_CI=true
WORKDIR /calypso

# Build a "source" layer
#
# This layer is populated with up-to-date files from
# Calypso development.
COPY . /calypso/
RUN yarn run build-packages:web

## Version debugging, temp uncomment if needed (Like working on a node upgrade)
## RUN node --version && yarn --version && npm --version

# Build the final layer
#
# This contains built environments of Calypso. It will
# change any time any of the Calypso source-code changes.
ENV NODE_ENV production
# Delete sourcemaps in the same layer as the build so trunk's hidden-source-map
# artifacts do not have to be committed and then whiteouted in a later snapshot.
RUN yarn run build 2>&1 | tee /tmp/build_log.txt \
     && find /calypso/build /calypso/public -name "*.*.map" -delete

# This will output a service message to TeamCity if the build cache was invalidated as seen in the build_log file.
RUN ./bin/check-log-for-cache-invalidation.sh /tmp/build_log.txt

###################
FROM node:${node_version}-alpine AS app

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
