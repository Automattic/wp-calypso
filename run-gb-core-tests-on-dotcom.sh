#!/bin/bash

# Env vars with secrets intentionally NOT being set. The goal of this script is
# to verify that all commands run succesfully and don't fail with node/npm
# mismatches. Once it works, this will be removed and the actual build on TC
# will take care of everything after we update it to use the new image with
# the right node version.

BASE_IMAGE_NAME="ci-e2e-gb-core-on-dotcom"
TEST_IMAGE_NAME="ci-e2e-gb-core-on-dotcom-test"

# --no-cache is used here to make the development flow easier.
echo "Building the base image: $BASE_IMAGE_NAME..."
docker build --no-cache -f $BASE_IMAGE_NAME.dockerfile -t $BASE_IMAGE_NAME:latest .

if [ $? -ne 0 ]; then
    echo "Failed to build the base image. Exiting..."
    exit 1
fi

# Similarly, ensure the latest version of the testing image is built
echo "Building the testing Docker image: $TEST_IMAGE_NAME..."
docker build --no-cache -f $TEST_IMAGE_NAME.dockerfile -t $TEST_IMAGE_NAME:latest .

if [ $? -ne 0 ]; then
    echo "Failed to build the testing image. Exiting..."
    exit 1
fi

echo "Running tests in Docker container..."
docker run $TEST_IMAGE_NAME

echo "Tests completed."
