FROM node:12.18.4 as builder

ARG commit_sha="(unknown)"
ARG workers
ENV CONTAINER 'docker'
ENV PROGRESS true
ENV COMMIT_SHA $commit_sha
ENV CALYPSO_ENV production
ENV WORKERS $workers
ENV BUILD_TRANSLATION_CHUNKS true
ENV CHROMEDRIVER_SKIP_DOWNLOAD true
ENV PUPPETEER_SKIP_DOWNLOAD true
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
RUN rm -fr /calypso/apps/editing-tookit /calypso/apps/o2-blocks /calypso/apps/wpcom-block-editor /calypso/test /calypso/desktop \
	&& yarn install --frozen-lockfile

# Build the final layer
#
# This contains built environments of Calypso. It will
# change any time any of the Calypso source-code changes.
RUN yarn run build && rm -fr .cache

###################
FROM node:12.18.4-alpine as app

ARG commit_sha="(unknown)"
ENV COMMIT_SHA $commit_sha
ENV NODE_ENV production
WORKDIR /calypso

RUN apk add --no-cache tini
COPY --from=builder --chown=nobody:nobody /calypso/ /calypso/

USER nobody
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "build/server.js"]
