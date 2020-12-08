#!/bin/sh
set -o errexit
set -o nounset
set -o pipefail

if [[ -z "${1:-}" ]] ; then
    echo "Missing version. Usage:"
	echo "$0 <version>"
    exit 1
fi

VERSION="$1"
BUILDER_IMAGE_NAME="registry.a8c.com/calypso/base"
CI_IMAGE_NAME="registry.a8c.com/calypso/ci"
BUILDER_IMAGE="${BUILDER_IMAGE_NAME}:${VERSION}"
CI_IMAGE="${CI_IMAGE_NAME}:${VERSION}"

docker build -f Dockerfile.base --no-cache --target builder -t "$BUILDER_IMAGE" .
docker build -f Dockerfile.base --target ci -t "$CI_IMAGE" .
