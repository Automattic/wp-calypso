#!/bin/bash
MAGELLAN=./node_modules/.bin/magellan
MOCHA_ARGS=""
WORKERS=6
GRUNT=./node_modules/.bin/grunt
REPORTER=""
PARALLEL=0
JOBS=0
OPTS=""
SCREENSIZES="mobile,desktop"
LOCALES="en"
BRANCH=""
RETURN=0
CLEAN=0
GREP=""
LOCAL_BROWSER="chrome"
FILE_LIST=""

# Warn if NODE_CONFIG_ENV variable is not set
if [ "$NODE_CONFIG_ENV" = "" ]; then
	echo "WARNING: NODE_CONFIG_ENV environment variable is not set."
	exit 1
fi

#disable selenium promise manager
export SELENIUM_PROMISE_MANAGER=0

# Function to join arrays into a string
function joinStr { local IFS="$1"; shift; echo "$*"; }

I18N_CONFIG="\"browser\":\"chrome\",\"proxy\":\"system\",\"saveAllScreenshots\":true"
IE11_CONFIG="\"sauce\":\"true\",\"sauceConfig\":\"win-ie11\""
SAFARI_CONFIG="\"sauce\":\"true\",\"sauceConfig\":\"osx-safari\""

declare -a MAGELLAN_CONFIGS

usage () {
  cat <<EOF
-a [workers]	  - Number of parallel workers in Magellan (defaults to 3)
-R		  - Use custom Slack/Spec/JUnit reporter, otherwise just use Spec reporter
-p 		  - Execute the tests in parallel via CircleCI envvars (implies -g -s mobile,desktop)
-S [commitHash]   - Run tests against given commit via https://calypso.live
-B [branch]	  - Run Jetpack tests on given Jetpack branch via https://jurassic.ninja
-s		  - Screensizes in a comma-separated list (defaults to mobile,desktop)
-g		  - Execute general tests in the specs/ directory
-j 		  - Execute Jetpack tests in the specs-jetpack-calypso/ directory (desktop and mobile)
-W		  - Execute WooCommerce tests in the specs-woocommerce/ directory (desktop and mobile)
-F		  - Execute tests tagged with @secure-auth
-C		  - Execute tests tagged with @canary
-J		  - Execute Jetpack connect tests tagged with @canary
-H [host]	  - Specify an alternate host for Jetpack tests
-w		  - Only execute signup tests on Windows/IE11, not compatible with -g flag
-z		  - Only execute canary tests on Windows/IE11, not compatible with -g flag
-y		  - Only execute canary tests on Safari 10 on Mac, not compatible with -g flag
-l [config]	  - Execute the tests via Sauce Labs with the given configuration
-c		  - Exit with status code 0 regardless of test results
-m [browsers]	  - Execute the multi-browser visual-diff tests with the given list of browsers via grunt.  Specify browsers in comma-separated list or 'all'
-i		  - Execute i18n NUX screenshot tests, not compatible with -g flag
-I		  - Execute tests in specs-i18n/ directory
-x		  - Execute the tests from the context of xvfb-run
-u [baseUrl]	  - Override the calypsoBaseURL config
-f [testFileList] - Specify a list of test files to run
-h		  - This help listing
EOF
  exit 1
}

if [ $# -eq 0 ]; then
  usage
fi

while getopts ":a:RpS:B:s:gjWCJH:wzyl:cm:f:iIUvxu:h:F" opt; do
  case $opt in
    a)
      WORKERS=$OPTARG
      continue
      ;;
    R)
      MOCHA_ARGS+="-R spec-junit-reporter "
      continue
      ;;
    p)
      PARALLEL=1
      continue
      ;;
    c)
      CLEAN=1
      continue
      ;;
    S)
      export LIVEBRANCHES="true"
      NODE_CONFIG_ARGS+=("\"liveBranch\":\"true\",\"calypsoBaseURL\":\"https://hash-$OPTARG.calypso.live\",\"branchName\":\"$BRANCHNAME\"")
      continue
      ;;
    B)
      export LIVEBRANCHES="true"
      NODE_CONFIG_ARGS+=("\"jetpackBranch\":\"true\",\"jetpackBranchName\":\"$OPTARG\"")
      continue
      ;;
    s)
      SCREENSIZES=$OPTARG
      continue
      ;;
    g)
      MAGELLAN_CONFIG="magellan.json"
      ;;
    i)
      NODE_CONFIG_ARGS+=$I18N_CONFIG
      LOCALES="en,pt-BR,es,ja,fr,he"
      export SCREENSHOTDIR="screenshots-i18n"
      MAGELLAN_CONFIG="magellan-i18n-nux.json"
      ;;
    I)
      SCREENSIZES="desktop"
      WORKERS=1 # We need to be careful to take it slow with Google
      NODE_CONFIG_ARGS+=$I18N_CONFIG
      LOCALES="en,es,pt-br,de,fr,he,ja,it,nl,ru,tr,id,zh-cn,zh-tw,ko,ar,sv"
      MAGELLAN_CONFIG="magellan-i18n.json"
      ;;
    w)
      NODE_CONFIG_ARGS+=$IE11_CONFIG
      LOCAL_BROWSER="ie11"
      SCREENSIZES="desktop"
      MAGELLAN_CONFIG="magellan-ie11.json"
      ;;
    z)
      NODE_CONFIG_ARGS+=$IE11_CONFIG
      LOCAL_BROWSER="ie11"
      SCREENSIZES="desktop"
      MAGELLAN_CONFIG="magellan-ie11-canary.json"
      ;;
    y)
      NODE_CONFIG_ARGS+=$SAFARI_CONFIG
      LOCAL_BROWSER="safari"
      SCREENSIZES="desktop"
      MAGELLAN_CONFIG="magellan-safari-canary.json"
      ;;
    l)
      NODE_CONFIG_ARGS+=("\"sauce\":\"true\",\"sauceConfig\":\"$OPTARG\"")
      continue
      ;;
    m)
      BROWSERS=$(echo $OPTARG | sed 's/,/ /g')
      if [ "$CI" != "true" ] || [ $CIRCLE_NODE_INDEX == 0 ]; then
        CMD="$GRUNT $BROWSERS"
        eval $CMD
      fi
      exit $?
      ;;
    j)
      WORKERS=3
      SCREENSIZES="desktop,mobile"
      MAGELLAN_CONFIG="magellan-jetpack.json"
      ;;
    J)
      SCREENSIZES="desktop"
      MAGELLAN_CONFIG="magellan-jetpack-canary.json"
      ;;
    W)
      SCREENSIZES="desktop,mobile"
      MAGELLAN_CONFIG="magellan-woocommerce.json"
      ;;
    C)
      SCREENSIZES="mobile"
      MAGELLAN_CONFIG="magellan-canary.json"
      ;;
    F)
      SCREENSIZES="desktop"
      MAGELLAN_CONFIG="magellan-2fa.json"
      ;;
    H)
      export JETPACKHOST=$OPTARG
      ;;
    x)
      NODE_CONFIG_ARGS+=("\"headless\":\"true\",\"useTestVideo\":\"false\"")
#       MAGELLAN="xvfb-run $MAGELLAN"
      ;;
    u)
      NODE_CONFIG_ARGS+=("\"calypsoBaseURL\":\"$OPTARG\"")
      continue
      ;;
    f)
      FILE_LIST=$OPTARG
      ;;
    h)
      usage
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      echo ""
      usage
      ;;
    :)
      echo "Option -$OPTARG requires an argument" >&2
      echo ""
      usage
      ;;
  esac

  MAGELLAN_CONFIGS+=("$MAGELLAN_CONFIG")
  unset MAGELLAN_CONFIG
done

# Skip any tests in the given variable - DOES NOT WORK WITH MAGELLAN - See issue #506
if [ "$SKIP_TEST_REGEX" != "" ]; then
  GREP="-i -g '$SKIP_TEST_REGEX'"
fi

if [ "$SUITE_TAG" != "" ]; then
  SUITE_TAG_OVERRIDE="--suiteTag='$SUITE_TAG'"
fi

# Combine any NODE_CONFIG entries into a single object
NODE_CONFIG_ARG="$(joinStr , ${NODE_CONFIG_ARGS[*]})"

if [ $PARALLEL == 1 ]; then
  # Assign an index to each test segment to run in parallel
  MOBILE=$(expr 0 % $CIRCLE_NODE_TOTAL)
  DESKTOP=$(expr 1 % $CIRCLE_NODE_TOTAL)
  echo "Parallel execution details:"
  echo "mobile=$MOBILE, desktop=$DESKTOP, node=$CIRCLE_NODE_INDEX, total=$CIRCLE_NODE_TOTAL"

  if [ $CIRCLE_NODE_INDEX == $MOBILE ]; then
      echo "Executing tests at mobile screen width"
      CMD="env BROWSERSIZE=mobile NODE_CONFIG='{$NODE_CONFIG_ARG}' $MAGELLAN --config=$MAGELLAN_CONFIGS --mocha_args='$MOCHA_ARGS' --max_workers=$WORKERS --local_browser=$LOCAL_BROWSER"

      eval $CMD
      RETURN+=$?
  fi
  if [ $CIRCLE_NODE_INDEX == $DESKTOP ]; then
      echo "Executing tests at desktop screen width"
      CMD="env BROWSERSIZE=desktop NODE_CONFIG='{$NODE_CONFIG_ARG}' $MAGELLAN --config=$MAGELLAN_CONFIGS --mocha_args='$MOCHA_ARGS' --max_workers=$WORKERS --local_browser=$LOCAL_BROWSER"

      eval $CMD
      RETURN+=$?
  fi
elif [ $CIRCLE_NODE_TOTAL > 1 ]; then
	IFS=, read -r -a SCREENSIZE_ARRAY <<< "$SCREENSIZES"
    IFS=, read -r -a LOCALE_ARRAY <<< "$LOCALES"
    for size in ${SCREENSIZE_ARRAY[@]}; do
      for locale in ${LOCALE_ARRAY[@]}; do
        for config in "${MAGELLAN_CONFIGS[@]}"; do
          if [ "$config" != "" ]; then
            if [[ "$config" == *"magellan.json"* ]]; then
            	S_T_OVERRIDE=$SUITE_TAG_OVERRIDE;
            else
            	S_T_OVERRIDE=""
            fi

            CMD="env BROWSERSIZE=$size BROWSERLOCALE=$locale NODE_CONFIG='{$NODE_CONFIG_ARG}' $MAGELLAN --mocha_args='$MOCHA_ARGS' --config='$config' --max_workers=$WORKERS --local_browser=$LOCAL_BROWSER --test=$FILE_LIST $S_T_OVERRIDE"

            eval $CMD
            RETURN+=$?
          fi
        done
      done
    done
else # Not using multiple CircleCI containers, just queue up the tests in sequence
  if [ "$CI" != "true" ] || [ $CIRCLE_NODE_INDEX == 0 ]; then
    IFS=, read -r -a SCREENSIZE_ARRAY <<< "$SCREENSIZES"
    IFS=, read -r -a LOCALE_ARRAY <<< "$LOCALES"
    for size in ${SCREENSIZE_ARRAY[@]}; do
      for locale in ${LOCALE_ARRAY[@]}; do
        for config in "${MAGELLAN_CONFIGS[@]}"; do
          if [ "$config" != "" ]; then
            CMD="env BROWSERSIZE=$size BROWSERLOCALE=$locale NODE_CONFIG='{$NODE_CONFIG_ARG}' $MAGELLAN --mocha_args='$MOCHA_ARGS' --config='$config' --max_workers=$WORKERS --local_browser=$LOCAL_BROWSER --debug"

            eval $CMD
            RETURN+=$?
          fi
        done
      done
    done
  fi
fi

if [ $CLEAN == 1 ]; then
  exit  0
fi

exit $RETURN
