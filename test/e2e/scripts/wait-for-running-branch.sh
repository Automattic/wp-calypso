#!/bin/bash

if [ "" == "$sha" ]; then
  echo "sha envvar not set";
  sha=$CIRCLE_SHA1
fi

if [[ "$calypsoSha" != "" ]] && [[ "$sha" != "$calypsoSha" ]]; then
    echo "Using calypsoSha envvar"
    sha=$calypsoSha
fi

COUNT=0
RESETATTEMPTS=0
RESETCOUNT=240 # 5sec retry = Reset the branch after 20 minutes
MAXCOUNT=360  # 5sec retry = Cancel after 30 minutes
SITEWAITCOUNT=30 # 5sec retry = Stop waiting after 2.5 minutes
MAXRESETATTEMPTS=1 # Limit reset attempts to one

STATUS=$(curl https://hash-$sha.calypso.live/status 2>/dev/null)

#Curl to start with no matter what
echo "Branch status = $STATUS, running curl https://hash-$sha.calypso.live/"
curl https://hash-$sha.calypso.live/ >/dev/null 2>&1

STATUS=$(curl https://hash-$sha.calypso.live/status 2>/dev/null)

echo "Branch status after initial curl = $STATUS https://hash-$sha.calypso.live/status"

until $(echo $STATUS | grep -wqe "Ready\|NeedsPriming" ); do
  if [ $COUNT == $MAXCOUNT ]; then
    echo "Reached maximum allowed wait time, quitting"
    exit 1
  elif [ $COUNT == $RESETCOUNT ]; then
    echo "Reached reset timeout, attempting to reset the branch"
    curl https://hash-$sha.calypso.live/?reset=true >/dev/null 2>&1
  elif [[ "$STATUS" == "FAIL" ]] && [[ $RESETATTEMPTS < $MAXRESETATTEMPTS ]]; then
    echo "Build Failed, attempting to reset the branch"
    curl https://hash-$sha.calypso.live/?reset=true >/dev/null 2>&1
    ((RESETATTEMPTS++))
    sleep 20
  elif [[ "$STATUS" == "FAIL" ]] && [[ $RESETATTEMPTS == $MAXRESETATTEMPTS ]]; then
    echo "Build Failed, and has already been reset the maximimum number of times. Failing script."
    exit 1
  fi

  # If it's still showing NotBuilt, then curl the branch directly rather than the status endpoint
  if [ "NotBuilt" == "$STATUS" ]; then
    echo "Branch status = $STATUS, running curl https://hash-$sha.calypso.live/"
    curl https://hash-$sha.calypso.live/ >/dev/null 2>&1
  fi

  sleep 5
  STATUS=$(curl https://hash-$sha.calypso.live/status 2>/dev/null)
  ((COUNT++))
  echo "Branch status now = $STATUS https://hash-$sha.calypso.live/status"
done

SITE=$(curl https://hash-$sha.calypso.live/ 2>/dev/null)
COUNT=0
until ! $(echo $SITE | grep -q "DServe Calypso" ); do
  if [ $COUNT == $SITEWAITCOUNT ]; then
    echo "Reached maximum allowed wait time, quitting"
    exit 1
  fi

  echo "Branch status is $STATUS, but site is not up yet. Waiting until it is up."

  ((COUNT++))
  sleep 5
  SITE=$(curl https://hash-$sha.calypso.live/ 2>/dev/null)
  STATUS=$(curl https://hash-$sha.calypso.live/status 2>/dev/null)
done
