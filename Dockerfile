ARG use_cache=false
ARG node_version=12.18.4

###################
FROM node:${node_version} as builder-cache-false


###################
# This image contains a directory /calypso/.cache which includes caches
# for yarn, terser, css-loader and babel.
FROM registry.a8c.com/calypso/base:latest as builder-cache-true

ENV YARN_CACHE_FOLDER=/calypso/.cache/yarn
ENV NPM_CONFIG_CACHE=/calypso/.cache


###################
FROM builder-cache-${use_cache} as builder

ARG commit_sha="(unknown)"
ARG workers=4
ARG node_memory=8192
ENV CONTAINER 'docker'
ENV PROGRESS true
ENV COMMIT_SHA $commit_sha
ENV CALYPSO_ENV production
ENV WORKERS $workers
ENV BUILD_TRANSLATION_CHUNKS true
ENV CHROMEDRIVER_SKIP_DOWNLOAD true
ENV PUPPETEER_SKIP_DOWNLOAD true
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
RUN rm -fr /calypso/apps/editing-toolkit /calypso/apps/o2-blocks /calypso/apps/wpcom-block-editor /calypso/test /calypso/desktop \
	&& yarn install --frozen-lockfile

# Build the final layer
#
# This contains built environments of Calypso. It will
# change any time any of the Calypso source-code changes.
RUN yarn run build && rm -fr .cache


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
CMD ["node", "build/server.js"]
