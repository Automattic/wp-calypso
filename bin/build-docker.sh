#!/bin/sh

VERSION="1.0.1"

BUILDER_IMAGE="automattic/wp-calypso-builder:${VERSION}"
CI_IMAGE="automattic/wp-calypso-ci:${VERSION}"

docker build -f Dockerfile.new --target wp-calypso-builder -t "$BUILDER_IMAGE" .
docker build -f Dockerfile.new --target wp-calypso-ci -t "$CI_IMAGE" .
docker tag "$CI_IMAGE" automattic/wp-calypso-ci:latest
docker tag "$BUILDER_IMAGE" automattic/wp-calypso-builder:latest
docker push "$CI_IMAGE"
docker push automattic/wp-calypso-ci:latest
docker push "$BUILDER_IMAGE"
docker push automattic/wp-calypso-builder:latest
