#!/bin/bash
set -x

MOCHA_ARGS=""
WORKERS=6
SCREENSIZES="mobile,desktop"
LOCALES="en"
RETURN=0
LOCAL_BROWSER="chrome"

# Warn if NODE_CONFIG_ENV variable is not set
if [ "$NODE_CONFIG_ENV" = "" ]; then
	echo "WARNING: NODE_CONFIG_ENV environment variable is not set."
	exit 1
fi

#disable selenium promise manager
export SELENIUM_PROMISE_MANAGER=0

# Function to join arrays into a string
function joinStr { local IFS="$1"; shift; echo "$*"; }

declare -a MAGELLAN_CONFIGS

usage () {
  cat <<EOF
-C		  - Execute tests tagged with @canary
-R		  - Use custom Slack/Spec/JUnit reporter, otherwise just use Spec reporter
-h		  - This help listing
EOF
  exit 1
}

if [ $# -eq 0 ]; then
  usage
fi

while getopts ":RCh" opt; do
  case $opt in
    R)
      MOCHA_ARGS+="-R spec-junit-reporter "
      continue
      ;;
    C)
      SCREENSIZES="mobile"
      MAGELLAN_CONFIG="magellan-canary.json"
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

IFS=, read -r -a SCREENSIZE_ARRAY <<< "$SCREENSIZES"
IFS=, read -r -a LOCALE_ARRAY <<< "$LOCALES"
for size in "${SCREENSIZE_ARRAY[@]}"; do
	for locale in "${LOCALE_ARRAY[@]}"; do
		for config in "${MAGELLAN_CONFIGS[@]}"; do
			if [ "$config" != "" ]; then
			echo "Starting"
			BROWSERSIZE="${size}" BROWSERLOCALE="${locale}" yarn magellan --mocha_args="${MOCHA_ARGS}" --config="${config}" --max_workers="${WORKERS}" --local_browser="${LOCAL_BROWSER}" --debug
			RETURN+=$?
			echo "Done"
			fi
		done
	done
done

exit $RETURN
