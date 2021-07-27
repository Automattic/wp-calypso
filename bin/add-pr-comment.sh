#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail
set -x

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

function delete() {
	url="${1}"
	curl --fail --silent --show-error --location \
		--header "Accept: application/vnd.github.v3+json" \
		--header "Authorization: token ${GH_TOKEN}" \
		-X DELETE "${url}"
}

# Returns the commentID if one exists in the given PR with the given watermark.
function get_existing_comment() {
	prNumber="${1}"
	watermark="${2}"
	get "https://api.github.com/repos/Automattic/wp-calypso/issues/${prNumber}/comments?per_page=100" | jq ". | map(select(.body | contains(\"${watermark}\")))[0] | .id"
}

# Sanitize parameters
branch="${1:-}"
watermarkName="${2:-}"
operation="${3:-}"
message="$(cat - | jq -Rs .)"

if [[ -z "$branch" ]]; then
	echo "Usage: ${0} <branch-name> [watermark] [operation]"
	echo ""
	echo "The script will find a PR for <branch-name> and add a message to it. If [watermark] is"
	echo "supplied, it will update any existing message created with the same [watermark]."
	echo ""
	echo "If 'delete' is provided as the operation and an existing comment on the PR matches the"
	echo "watermark, that comment will be deleted."
	echo ""
	echo "The content of the message will be read from STDIN."
	exit 1
fi

echo "Getting PRs associated with branch '${branch}'..."
prNumber=$(get "https://api.github.com/repos/Automattic/wp-calypso/pulls?head=Automattic:${branch}" | jq '.[].number')
if [[ -z "${prNumber}" ]]; then
	echo "PR for '${branch}' not found"
	exit 1
fi

if [[ "$operation" == "delete" ]]; then
	if [[ -z "$watermarkName" ]]; then
		echo "A watermark is required for deleting comments."
		exit 1
	fi
	# `-watermark:apr@v1` is used to avod collisions with other script that use watermarks.
	watermark="<!--${watermarkName}-watermark:apr@v1-->"
	commentId=$(get_existing_comment "$prNumber" "$watermark")
	if [[ -z "${commentId}" || "${commentId}" == "null" ]]; then
		echo "No comment found to delete."
		exit 1
	fi
	echo "Deleting comment"
	delete "https://api.github.com/repos/Automattic/wp-calypso/issues/comments/${commentId}"
	exit
fi

if [[ -z "$watermarkName" ]]; then
	echo "Creating comment"
	post "https://api.github.com/repos/Automattic/wp-calypso/issues/${prNumber}/comments" "{\"body\":${message}}" > /dev/null
else
	# `-watermark:apr@v1` is used to avod collisions with other script that use watermarks.
	watermark="<!--${watermarkName}-watermark:apr@v1-->"
	watermarkedMessage="${message/%\"/${watermark}\"}"
	commentId=$(get_existing_comment "$prNumber" "$watermark")
	if [[ -z "${commentId}" || "${commentId}" == "null" ]]; then
		echo "Creating comment"
		post "https://api.github.com/repos/Automattic/wp-calypso/issues/${prNumber}/comments" "{\"body\":${watermarkedMessage}}" > /dev/null
	else
		echo "Updating comment"
		post "https://api.github.com/repos/Automattic/wp-calypso/issues/comments/${commentId}" "{\"body\":${watermarkedMessage}}" > /dev/null
	fi
fi
