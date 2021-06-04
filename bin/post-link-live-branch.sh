#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

### Expected binaries
# - jq
# - curl
### Expected en vars
# - GH_TOKEN

function get() {
	url="${1}"
	curl --fail --silent --show-error --location \
		--header "Accept: application/vnd.github.v3+json" \
		--header "Authorization: token ${GH_TOKEN}" \
		"${url}"
}

function post() {
	url="${1}"
	data="${2}"
	curl --fail --silent --show-error --location \
		--header "Accept: application/vnd.github.v3+json" \
		--header "Authorization: token ${GH_TOKEN}" \
		-X POST "${url}" --data "${data}"
}

# Sanitize parameters
branch="${1:-}"
link="${2:-}"
if [[ -z "$branch" ]]; then
	echo "Usage: ${0} <branch-name> [link]"
	exit 1
fi

# Compose messages
WATERMARK="<!--calypso.live-watermark-->"
GENERATING=$(jq -Rs . <<- EOF
	${WATERMARK}
	Link to live branch is being generated...
	Please wait a few minutes and refresh this page.
EOF
)
LINK=$(jq -Rs . <<- EOF
	${WATERMARK}
	Link to live branch: ${link}
EOF
)
if [[ -z "${link}" ]]; then
	message="${GENERATING}"
else
	message="${LINK}"
fi

echo "Getting PRs associated with branch '${branch}'..."
prNumber=$(get "https://api.github.com/repos/Automattic/wp-calypso/pulls?head=Automattic:${branch}" | jq '.[].number')
if [[ -z "${prNumber}" ]]; then
	echo "PR for '${branch}' not found"
	exit 1
fi

echo "Getting comments in the PR #${prNumber}..."
commentId=$(get "https://api.github.com/repos/Automattic/wp-calypso/issues/${prNumber}/comments?per_page=100" | jq ". | map(select(.body | contains(\"${WATERMARK}\")))[0] | .id")

if [[ -z "${commentId}" || "${commentId}" == "null" ]]; then
	echo "Creating comment"
	post "https://api.github.com/repos/Automattic/wp-calypso/issues/${prNumber}/comments" "{\"body\":${message}}" > /dev/null
else
	echo "Updating comment"
	post "https://api.github.com/repos/Automattic/wp-calypso/issues/comments/${commentId}" "{\"body\":${message}}" > /dev/null
fi
