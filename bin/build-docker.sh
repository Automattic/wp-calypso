#!/bin/sh

VERSION="1.0.5"

BUILDER_IMAGE_NAME="automattic/wp-calypso-base"
CI_IMAGE_NAME="automattic/wp-calypso-ci"
BUILDER_IMAGE="${BUILDER_IMAGE_NAME}:${VERSION}"
CI_IMAGE="${CI_IMAGE_NAME}:${VERSION}"

docker build -f docker/Dockerfile --target builder -t "$BUILDER_IMAGE" .
docker build -f docker/Dockerfile --target ci -t "$CI_IMAGE" .
docker tag "$BUILDER_IMAGE" "${BUILDER_IMAGE_NAME}:latest"
docker tag "$CI_IMAGE" "${CI_IMAGE_NAME}:latest"
docker push "$CI_IMAGE"
docker push "${CI_IMAGE_NAME}:latest"
docker push "$BUILDER_IMAGE"
docker push "${BUILDER_IMAGE_NAME}:latest"
