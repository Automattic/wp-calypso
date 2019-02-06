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
  NODE_ENV=$NODE_ENV_OVERRIDE
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

#Check if matching branch exists in wp-calypso
if [ "$CIRCLE_BRANCH" != "master" ]; then
    sudo apt-get install jq > /dev/null &&
    MATCH_SHA=$(curl -s -X GET https://api.github.com/repos/Automattic/wp-calypso/branches/${CIRCLE_BRANCH} | jq -r '.commit.sha')

    if [ "$MATCH_SHA" != null ]; then
        TESTARGS+=" -S $MATCH_SHA"
        echo "Found matching branch in wp-calypso. Running against calypso.live"

        # Make sure branch is up and running before we continue
        COUNT=0
        RESETCOUNT=60 # 5sec retry = Reset the branch after 5 minutes
        MAXCOUNT=120  # 5sec retry = Cancel after 10 minutes
        SITEWAITCOUNT=30 # 5sec retry = Stop waiting after 2.5 minutes

        STATUS=$(curl https://hash-$MATCH_SHA.calypso.live/status 2>/dev/null)

        #Curl to start with no matter what
        echo "Branch status = $STATUS, running curl https://hash-$MATCH_SHA.calypso.live/"
        curl https://hash-$MATCH_SHA.calypso.live/ >/dev/null 2>&1

        STATUS=$(curl https://hash-$MATCH_SHA.calypso.live/status 2>/dev/null)

        echo "Branch status after initial curl = $STATUS https://hash-$MATCH_SHA.calypso.live/status"

        until $(echo $STATUS | grep -wqe "Ready\|NeedsPriming" ); do
            if [ $COUNT == $MAXCOUNT ]; then
                echo "Reached maximum allowed wait time, quitting"
                exit 1
            elif [ $COUNT == $RESETCOUNT ]; then
                echo "Reached reset timeout, attempting to reset the branch"
                curl https://hash-$MATCH_SHA.calypso.live/?reset=true >/dev/null 2>&1
            fi

            # If it's still showing NotBuilt, then curl the branch directly rather than the status endpoint
            if [ "NotBuilt" == "$STATUS" ]; then
                echo "Branch status = $STATUS, running curl https://hash-$MATCH_SHA.calypso.live/"
                curl https://hash-$MATCH_SHA.calypso.live/ >/dev/null 2>&1
            fi

            sleep 5
            STATUS=$(curl https://hash-$MATCH_SHA.calypso.live/status 2>/dev/null)
            ((COUNT++))
            echo "Branch status now = $STATUS https://hash-$MATCH_SHA.calypso.live/status"
        done

        SITE=$(curl https://hash-$MATCH_SHA.calypso.live/ 2>/dev/null)
        COUNT=0
        until ! $(echo $SITE | grep -q "DServe Calypso" ); do
            if [ $COUNT == $SITEWAITCOUNT ]; then
                echo "Reached maximum allowed wait time, quitting"
                exit 1
            fi

             echo "Branch status is $STATUS, but site is not up yet. Waiting until it is up."

            ((COUNT++))
            sleep 5
            SITE=$(curl https://hash-$MATCH_SHA.calypso.live/ 2>/dev/null)
            STATUS=$(curl https://hash-$MATCH_SHA.calypso.live/status 2>/dev/null)
        done
    fi
fi

# If on CI and the -x flag is not yet set, set it
#if [ "$CI" == "true" ] && [[ "$TESTARGS" != *"-x"* ]]; then
#  TESTARGS+=" -x"
#fi

npm test
