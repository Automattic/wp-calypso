#!/bin/bash
# PROTOTYPE (DOTMSD-1670): time "server build + boot until /health answers" for each variant.
# The client bundler is skipped (PROTOTYPE_NO_CLIENT_BUNDLER=1) so only the server path is timed.
#
#   client/server/PROTOTYPE-server-build/bench.sh [runs]
set -u
cd "$( dirname "$0" )/../../.."
RUNS=${1:-3}
export CALYPSO_ENV=dashboard-development NODE_ENV=development BROWSERSLIST_ENV=server
export PROTOTYPE_NO_CLIENT_BUNDLER=1 PORT=3999 NO_COLOR=1
DIR=client/server/PROTOTYPE-server-build
now() { python3 -c 'import time;print(int(time.time()*1000))'; }

# Boots "$@" and prints ms until /health answers, plus the server's peak RSS in MB.
boot() {
	local s=$( now ) pid peak=0 rss
	"$@" > /dev/null 2>&1 &
	pid=$!
	until curl -s -o /dev/null localhost:3999/health; do
		kill -0 $pid 2> /dev/null || { echo "FAIL"; return; }
		rss=$( ps -o rss= -p $pid 2> /dev/null | tr -d ' ' ); [ "${rss:-0}" -gt $peak ] && peak=$rss
		python3 -c 'import time;time.sleep(0.02)'
	done
	rss=$( ps -o rss= -p $pid | tr -d ' ' ); [ "${rss:-0}" -gt $peak ] && peak=$rss
	echo "$(( $( now ) - s )) $(( peak / 1024 ))"
	kill $pid; wait $pid 2> /dev/null
}
timed() { local s=$( now ); "$@" > /dev/null 2>&1 || echo "build failed: $*" >&2; echo $(( $( now ) - s )); }
row() { printf '%-34s build %6sms  boot %6sms  total %6sms  boot RSS %5sMB\n' "$1" "$2" "$3" $(( $2 + $3 )) "$4"; }

WEBPACK="node node_modules/.bin/webpack --config client/webpack.config.node.js --stats-preset errors-only"
for i in $( seq 1 "$RUNS" ); do
	rm -rf .cache/babel-server .cache/webpack-server
	b=$( timed env PROTOTYPE_SERVER_CACHE=0 $WEBPACK ); read -r t m <<< "$( boot node build/server.js )"
	row "(a) webpack, today (cold)" "$b" "$t" "$m"
	b=$( timed env PROTOTYPE_SERVER_CACHE=0 $WEBPACK ); read -r t m <<< "$( boot node build/server.js )"
	row "(a) webpack, today (babel warm)" "$b" "$t" "$m"
	b=$( timed env PROTOTYPE_SERVER_CACHE=1 $WEBPACK ); read -r t m <<< "$( boot node build/server.js )"
	row "(b) webpack + fs cache (prime)" "$b" "$t" "$m"
	b=$( timed env PROTOTYPE_SERVER_CACHE=1 $WEBPACK ); read -r t m <<< "$( boot node build/server.js )"
	row "(b) webpack + fs cache (warm)" "$b" "$t" "$m"
	read -r t m <<< "$( boot node $DIR/run-with-module-runner.mjs )"
	row "(c) Vite module runner" 0 "$t" "$m"
	b=$( timed node $DIR/build-with-vite.mjs ); read -r t m <<< "$( boot node build/server-vite.cjs )"
	row "(e) Vite SSR build (Rolldown)" "$b" "$t" "$m"
done
