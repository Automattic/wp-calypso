#!/bin/bash

currentVersion=$(node -v)
expectedVersion=$(<.nvmrc)

update-wrapper-node-version () {
    version=${expectedVersion:1}
    config=( $(jq -r '.circleCIToken' ./config/local-${NODE_CONFIG_ENV}.json) )
    token=${config[0]}

    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-for-branches/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-canary-for-branches/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-canary/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-ie11/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-jetpack/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-jetpack-be/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-woocommerce/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-i18n/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-jetpack-smoke/envvar?circle-token=${token}
}


head-changed-file () {
        set -- $(git rev-parse "@:$1" "@~:$1")
        [[ $1 != $2 ]]
}

update-node () {
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    nvm install $expectedVersion &&
    nvm alias default $expectedVersion
}

if head-changed-file ".nvmrc" && [ $expectedVersion != $currentVersion ]; then
    update-node
fi


if head-changed-file ".nvmrc" && [ "$CIRCLE_BRANCH" = "trunk" ] && [ $expectedVersion != $currentVersion ]; then
    update-wrapper-node-version
else
    echo ".nvmrc file not updated or is not on trunk"
fi
