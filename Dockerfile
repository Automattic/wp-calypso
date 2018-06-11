FROM       node:10.4.0
LABEL maintainer="Automattic"

WORKDIR    /calypso


ENV        CONTAINER 'docker'
ENV        NODE_PATH=/calypso/server:/calypso/client

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

# Build a "dependencies" layer
#
# This layer should include all required npm modules
# and should only change as often as the dependencies
# change. This layer should allow for final build times
# to be limited only by the Calypso build speed.
COPY       ./package.json ./npm-shrinkwrap.json /calypso/
RUN        npm ci

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
ARG        commit_sha="(unknown)"
ENV        COMMIT_SHA $commit_sha

RUN        CALYPSO_ENV=production npm run build

USER       nobody
CMD        NODE_ENV=production node build/bundle.js
