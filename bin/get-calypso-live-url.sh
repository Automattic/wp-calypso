#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

### Expected binaries
# - curl

# Sanitize parameters
build="${1:-}"
env="${2:-}"

if [[ -z "$build" ]]; then
	echo "Usage: ${0} <build-number> [environment]"
	echo ""
	echo "Example: ${0} 1234"
	echo "Example: ${0} 1234 dashboard"
	echo ""
	echo "It will hit https://calypso.live?image=registry.a8c.com/calypso/app:build-<build-number>[&env=<environment>] and get"
	echo "and output the corresponding https://<container-name>.calypso.live URL".
	exit 1
fi

if [[ -z "$env" ]]; then
	IMAGE_URL="https://calypso.live?image=registry.a8c.com/calypso/app:build-${build}";
else
	IMAGE_URL="https://calypso.live?image=registry.a8c.com/calypso/app:build-${build}&env=${env}";
fi
MAX_LOOP=10
COUNTER=0

# Transform an URL like https://calypso.live?image=... into https://<container>.calypso.live
while [[ $COUNTER -le $MAX_LOOP ]]; do
	COUNTER=$((COUNTER+1))
	REDIRECT=$(curl --output /dev/null --silent --show-error  --write-out "%{http_code} %{redirect_url}" "${IMAGE_URL}")
	read -r HTTP_STATUS URL <<< "${REDIRECT}"

	# 202 means the image is being downloaded, retry in a few seconds
	if [[ "${HTTP_STATUS}" -eq "202" ]]; then
		sleep 5
		continue
	fi

	break
done

if [[ -z "$URL" ]]; then
	echo "Can't redirect to ${IMAGE_URL}" >&2
	echo "Curl response: ${REDIRECT}" >&2
	exit 1
fi

# Poll the container URL until it returns HTTP 200 (ready to serve).
# After URL resolution, containers typically need 5-7s before accepting connections.
MAX_READY_LOOP=30
READY_COUNTER=0
echo "Waiting for ${URL} to be ready..." >&2

while [[ $READY_COUNTER -le $MAX_READY_LOOP ]]; do
	READY_COUNTER=$((READY_COUNTER+1))
	READY_STATUS=$(curl --output /dev/null --silent --connect-timeout 1 --max-time 3 --write-out "%{http_code}" --location "$URL") || READY_STATUS="000"

	if [[ "${READY_STATUS}" -eq "200" ]]; then
		echo "Container ready after ${READY_COUNTER}s" >&2
		break
	fi

	echo "Probe #${READY_COUNTER}: HTTP ${READY_STATUS}, retrying..." >&2
	sleep 1
done

if [[ "${READY_STATUS}" -ne "200" ]]; then
	echo "Warning: container not ready after ${MAX_READY_LOOP}s (last HTTP ${READY_STATUS}), proceeding anyway" >&2
fi

echo "$URL"
