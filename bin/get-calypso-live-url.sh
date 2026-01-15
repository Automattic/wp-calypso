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

echo "$URL"
