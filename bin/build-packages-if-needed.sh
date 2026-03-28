#!/bin/bash

# The WP / dev-server spinners only run once `node build/server.js` starts — they do not
# cover this step. Optional spinner here wraps only the long `yarn workspaces … prepare`
# path. Set CALYPSO_NO_START_ANIM=1 for plain output.

spin_frames=( ⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏ )

run_with_spinner() {
	local msg="$1"
	shift

	if [ "${CALYPSO_NO_START_ANIM:-}" = "1" ] || [ ! -t 2 ] || [ "${CI:-}" = "true" ]; then
		"$@"
		return $?
	fi

	local pid i=0
	"$@" &
	pid=$!
	while kill -0 "$pid" 2>/dev/null; do
		printf '\r\033[36m%s\033[0m %s\033[K' "${spin_frames[$((i % 10))]}" "$msg" >&2
		sleep 0.1
		i=$((i + 1))
	done
	wait "$pid"
	local ret=$?
	printf '\r\033[K' >&2
	return $ret
}

if [ "${SKIP_CALYPSO_PACKAGE_BUILDS:-}" = "true" ] ; then
	echo "Skipping workspace package build fallback."
	exit 0
fi

# yarn start fails when this package is not built. It a good indication that the
# prerequisite packages were cleaned and need to be prepared again.
if [ ! -d "packages/create-calypso-config/dist" ] ; then
	run_with_spinner "Building workspace packages…" \
		yarn workspaces foreach --all --parallel --topological --verbose run prepare
else
	echo "Packages are ready — running Calypso build next (static, CSS, webpack)."
fi
