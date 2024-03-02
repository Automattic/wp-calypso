# This is an image to be used locally to test what would be run in CI without needing to run the actual build.
# It basically emulates what's already being done as part of the following build type:
# - https://github.com/Automattic/wp-calypso/blob/66fa0929bf0640f438431c2e6e8a2cf97856f4e2/.teamcity/_self/projects/WPComTests.kt#L74
# It's useful to test the base image locally without needing to go all the way to TeamCity or pushing images to the Docker registry.
# This might be removed later.
#
# TODO:
# After this is proven to work well (at least not failing with node/npm version mismatch), then:
# 1. Build the `ci-e2e-gb-core-on-dotcom` image and push it to the A8C Docker registry;
# 2. Setup the build type here https://github.com/Automattic/wp-calypso/blob/66fa0929bf0640f438431c2e6e8a2cf97856f4e2/.teamcity/_self/projects/WPComTests.kt#L74 to use it, example: https://href.li/?https://github.com/Automattic/wp-calypso/blob/trunk/.teamcity/_self/lib/customBuildType/E2EBuildType.kt#L162;
# 3. Cross fingers :)

# Check run-gb-core-tests-on-dotcom.sh for more info.
FROM ci-e2e-gb-core-on-dotcom:latest AS ci-e2e-gb-core-on-dotcom-test

WORKDIR /workspace

# Clone Gutenberg and prepare it for the E2E tests, and run them
RUN git clone --depth 1 -b try/run-e2e-tests-against-wpcom https://github.com/WordPress/gutenberg.git /workspace/gutenberg && \
    cd /workspace/gutenberg && \
    npm ci && \
    npm run build:packages && \
		npm run test:e2e:playwright
