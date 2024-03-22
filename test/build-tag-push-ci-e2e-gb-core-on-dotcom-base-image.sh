#!/bin/bash

# Build the base image used for running core tests on dotcom.
# See https://github.com/Automattic/wp-calypso/pull/88104 for more context.

BASE_IMAGE_NAME="ci-e2e-gb-core-on-dotcom"
REGISTRY_URL="registry.a8c.com/calypso"  # Change this to your actual registry URL
IMAGE_TAG="latest"

# --no-cache is used here to make the development flow easier.
echo "Building the base image: $BASE_IMAGE_NAME..."
docker build --no-cache -f $BASE_IMAGE_NAME.dockerfile -t $BASE_IMAGE_NAME:$IMAGE_TAG .

if [ $? -ne 0 ]; then
    echo "Failed to build the base image. Exiting..."
    exit 1
fi

# Tag the image for the registry
docker tag $BASE_IMAGE_NAME:$IMAGE_TAG $REGISTRY_URL/$BASE_IMAGE_NAME:$IMAGE_TAG

# Push the image to the registry
echo "Pushing the base image to the registry..."
docker push $REGISTRY_URL/$BASE_IMAGE_NAME:$IMAGE_TAG

if [ $? -ne 0 ]; then
    echo "Failed to push the base image to the registry. Exiting..."
    exit 1
fi

echo "All good, see ya!"
