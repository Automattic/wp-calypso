#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:-Automattic/wp-calypso}"
DRY_RUN="${DRY_RUN:-true}"
PARALLEL="${PARALLEL:-4}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="${OUT_DIR:-$(mktemp -d)}"
MARKER='<!-- pr-confidence'
LABEL_PREFIX='[AI Confidence]'
export REPO DIR OUT MARKER LABEL_PREFIX DRY_RUN

# Prints the PR numbers to score: the arguments, or every open non-draft PR when none are given.
list_prs() {
	if [ "$#" -gt 0 ]; then
		printf '%s\n' "$@" | grep -E '^[0-9]+$'
	else
		gh pr list --repo "$REPO" --state open --limit 500 --json number,isDraft --jq '.[] | select(.isDraft | not) | .number'
	fi
}

# Prints a skip reason for a PR, or nothing when it should be scored.
skip_reason() {
	local pr="$1" meta perm last_marker
	meta=$(gh pr view "$pr" --repo "$REPO" --json isDraft,author,headRefOid,headRepositoryOwner,headRepository,reviewDecision)
	if [ "$(jq -r .isDraft <<<"$meta")" = "true" ]; then echo "draft"; return; fi
	if [ "$(jq -r .author.is_bot <<<"$meta")" = "true" ]; then echo "bot author"; return; fi
	if [ "$(jq -r '"\(.headRepositoryOwner.login)/\(.headRepository.name)"' <<<"$meta")" != "$REPO" ]; then echo "fork"; return; fi
	if [ "$(jq -r .reviewDecision <<<"$meta")" = "APPROVED" ]; then echo "already approved"; return; fi
	perm=$(gh api "repos/$REPO/collaborators/$(jq -r .author.login <<<"$meta")/permission" --jq .permission 2>/dev/null || echo none)
	case "$perm" in admin | write) ;; *) echo "author permission $perm"; return ;; esac
	last_marker=$(gh api "repos/$REPO/issues/$pr/comments" --paginate --jq ".[] | select(.body | startswith(\"$MARKER\")) | .body | split(\"\n\")[0]" | tail -1)
	if [ "$last_marker" = "$MARKER sha=$(jq -r .headRefOid <<<"$meta") fix_here=$("$DIR/fix-here-count.sh" "$pr" "$REPO") -->" ]; then
		echo "already scored at this commit"
		return
	fi
}

# Writes the confidence label and the PR comment for one scored result.
apply_result() {
	local result="$1" pr level body comment_id
	pr=$(jq -r .pr <<<"$result")
	level=$(jq -r .level <<<"$result")
	body=$(jq -r --arg marker "$MARKER" '
		"\($marker) sha=\(.sha) fix_here=\(.signals.unresolved_fix_here_comments) -->\n**AI confidence: \(.level)** — " + ([.reasons[] | gsub("@"; "@​")] | join("; ")) + ".\n\n<sub>Helps reviewers prioritise; not a substitute for review. Re-scored when new commits land.</sub>"' <<<"$result")
	for other in Low Medium High; do
		if [ "$other" != "$level" ]; then
			gh pr edit "$pr" --repo "$REPO" --remove-label "$LABEL_PREFIX $other" >/dev/null 2>&1 || true
		fi
	done
	gh pr edit "$pr" --repo "$REPO" --add-label "$LABEL_PREFIX $level" >/dev/null
	comment_id=$(gh api "repos/$REPO/issues/$pr/comments" --paginate --jq ".[] | select(.body | startswith(\"$MARKER\")) | .id" | tail -1)
	if [ -n "$comment_id" ]; then
		gh api -X PATCH "repos/$REPO/issues/comments/$comment_id" -f body="$body" >/dev/null
	else
		gh pr comment "$pr" --repo "$REPO" --body "$body" >/dev/null
	fi
}

# Scores one PR and either applies the result or records it for the dry-run summary.
process_pr() {
	local pr="$1" reason result
	reason=$(skip_reason "$pr")
	if [ -n "$reason" ]; then
		jq -nc --argjson pr "$pr" --arg reason "$reason" '{pr: $pr, skipped: $reason}' >"$OUT/$pr.json"
		return
	fi
	if ! result=$("$DIR/score.sh" "$pr" "$REPO"); then
		jq -nc --argjson pr "$pr" '{pr: $pr, error: "scoring failed"}' >"$OUT/$pr.json"
		return
	fi
	echo "$result" >"$OUT/$pr.json"
	if [ "$DRY_RUN" != "true" ]; then
		apply_result "$result"
	fi
}
export -f skip_reason apply_result process_pr

# Prints a markdown table of every result in the output directory.
summarize() {
	echo "| PR | Confidence | Model said | Reasons |"
	echo "| --- | --- | --- | --- |"
	jq -rs 'sort_by(.pr)[] | if .skipped then "| #\(.pr) | skipped | | \(.skipped) |"
		elif .error then "| #\(.pr) | error | | \(.error) |"
		else "| #\(.pr) | \(.level) | \(.model_level) | \(.reasons | join("; ")) |" end' "$OUT"/*.json
	jq -rs '"\nScored \(map(select(.level)) | length), skipped \(map(select(.skipped)) | length), errors \(map(select(.error)) | length). Cost $\(map(.cost_usd // 0) | add * 100 | round / 100)."' "$OUT"/*.json
}

if [ "$DRY_RUN" != "true" ]; then
	for level in Low Medium High; do
		gh label create "$LABEL_PREFIX $level" --repo "$REPO" --color "$(case $level in Low) echo d93f0b ;; Medium) echo fbca04 ;; High) echo 0e8a16 ;; esac)" \
			--description "AI estimate of how much careful review this PR needs" >/dev/null 2>&1 || true
	done
fi

list_prs "$@" | xargs -P "$PARALLEL" -I{} bash -c 'process_pr "$1"' _ {}
summarize
