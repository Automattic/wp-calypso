#!/bin/bash

# Resolve pre-installed NVM_DIR on Linux machine executor:
# https://discuss.circleci.com/t/circleci-forgetting-node-version-on-machine-executor/28813

set +e
set +x
export NVM_DIR="/opt/circleci/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"