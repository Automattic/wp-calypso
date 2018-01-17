FROM       node:8.9.3-alpine
LABEL maintainer="Automattic"

RUN apk add --no-cache git

WORKDIR    /calypso

ENV        CONTAINER 'docker'
ENV        NODE_PATH=/calypso/server:/calypso/client

ARG        npm_registry
ENV        NPM_CONFIG_REGISTRY=$npm_registry

# Build a "dependencies" layer
#
# This layer should include all required npm modules
# and should only change as often as the dependencies
# change. This layer should allow for final build times
# to be limited only by the Calypso build speed.
COPY       ./package.json ./npm-shrinkwrap.json /calypso/
RUN        true \
           && npm install --production \
           && chown -R nobody node_modules \
           && rm -rf /root/.npm \
           && true

# Build a "source" layer
#
# This layer is populated with up-to-date files from
# Calypso development.
#
# If package.json and npm-shrinkwrap are unchanged,
# `install-if-deps-outdated` should require no action.
# However, time is being spent in the build step on
# `install-if-deps-outdated`. This is because in the
# following COPY, the npm-shrinkwrap mtime is being
# updated, which is confusing `install-if-deps-outdated`.
# Touch after copy to ensure that this layer will
# not trigger additional install as part of the build
# in the following step.
COPY       . /calypso/
RUN        touch node_modules

# Build the final layer
#
# This contains built environments of Calypso. It will
# change any time any of the Calypso source-code changes.
ARG        commit_sha=(unknown)
RUN        true \
           && CALYPSO_ENV=production COMMIT_SHA=$commit_sha npm run build \
           && find . -not -path './node_modules/*' -print0 | xargs -0 chown nobody \
           && true

USER       nobody
CMD        NODE_ENV=production node build/bundle.js
