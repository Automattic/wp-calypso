#!/usr/bin/env bash
set -euo pipefail

PR="$1"
REPO="${2:-Automattic/wp-calypso}"

gh api graphql -F owner="${REPO%%/*}" -F name="${REPO##*/}" -F pr="$PR" -f query='
	query($owner: String!, $name: String!, $pr: Int!) {
		repository(owner: $owner, name: $name) {
			pullRequest(number: $pr) {
				reviewThreads(first: 100) {
					nodes { isResolved comments(first: 1) { nodes { body } } }
				}
			}
		}
	}' --jq '[.data.repository.pullRequest.reviewThreads.nodes[]
		| select(.isResolved | not)
		| select(.comments.nodes[0].body | contains("[fix here]"))] | length'
