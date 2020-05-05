#!/bin/bash

# Notify Slack if any tests are being skipped -- Only runs on Node 0 so you just get one ping
# -- Note that since this is called before run.sh the BROWSERSIZE variable is not yet set and
#    it will always say "screen size 'desktop'"
if [ "$CIRCLE_NODE_INDEX" == "0" ]; then
  if [ "$SKIP_TEST_REGEX" != "" ]; then
    ./node_modules/.bin/babel-node --presets es2015 lib/slack-ping-cli.js "Attention! Tests are being skipped with pattern [$SKIP_TEST_REGEX]"
  fi
  if [ "$DISABLE_EMAIL" == "true" ]; then
    ./node_modules/.bin/babel-node --presets es2015 lib/slack-ping-cli.js "WARNING::: Any test that uses email is currently disabled as DISABLE_EMAIL is set to true"
  fi
fi

if [ "$NODE_ENV_OVERRIDE" != "" ]; then
  NODE_CONFIG_ENV=$NODE_ENV_OVERRIDE
fi

#disable selenium promise manager
export SELENIUM_PROMISE_MANAGER=0
export TEST_VIDEO="true"
export TESTARGS="-R -p"

if [ "$RUN_SPECIFIED" == "true" ]; then
  TESTARGS=$RUN_ARGS
elif [[ "$CIRCLE_BRANCH" =~ .*[Jj]etpack.*|.*[Jj][Pp].* ]]; then
  export JETPACKHOST=PRESSABLE
  export TARGET=JETPACK
  TESTARGS="-R -j" # Execute Jetpack tests
elif [[ "$CIRCLE_BRANCH" =~ .*[Ww][Oo][Oo].* ]]; then
  export TARGET=WOO
  TESTARGS="-R -W" # Execute WooCommerce tests
elif [[ "$CIRCLE_BRANCH" =~ .*[Ii][Ee][1][1].* ]]; then
  export TARGET=IE11
  TESTARGS="-R -w" # Execute IE11 tests
elif [ "$CIRCLE_BRANCH" == "master" ]; then
  TESTARGS="-R -p" # Parallel execution, implies -g -s mobile,desktop
fi

# If on CI and the -x flag is not yet set, set it
#if [ "$CI" == "true" ] && [[ "$TESTARGS" != *"-x"* ]]; then
#  TESTARGS+=" -x"
#fi

yarn test
