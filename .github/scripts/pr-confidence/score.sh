#!/usr/bin/env bash
set -euo pipefail

PR="$1"
REPO="${2:-Automattic/wp-calypso}"
MODEL="${PR_CONFIDENCE_MODEL:-claude-sonnet-5-5}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAX_DIFF_CHARS=80000

LOW_CAP_PATHS='^(\.github/workflows/|client/my-sites/checkout/|client/login/|client/server/|client/me/purchases/|client/dashboard/me/billing-purchases/)'
MEDIUM_CAP_PATHS='^(client/(state|components|lib|layout)/|packages/|config/|package\.json$|yarn\.lock$)'
TEST_PATHS='(\.test\.|\.spec\.|/test/|__tests__/)'

PR_JSON=$(gh pr view "$PR" --repo "$REPO" --json number,title,body,headRefOid,additions,deletions,changedFiles,files,statusCheckRollup)

OWNER="${REPO%%/*}"
NAME="${REPO##*/}"
FIX_HERE=$(gh api graphql -F owner="$OWNER" -F name="$NAME" -F pr="$PR" -f query='
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
		| select(.comments.nodes[0].body | contains("[fix here]"))] | length')

SIGNALS=$(jq -c \
	--arg low "$LOW_CAP_PATHS" \
	--arg medium "$MEDIUM_CAP_PATHS" \
	--arg tests "$TEST_PATHS" \
	--argjson fix_here "$FIX_HERE" '
	[.files[].path] as $paths
	| {
		lines_changed: (.additions + .deletions),
		files_changed: .changedFiles,
		sensitive_paths: [$paths[] | select(test($low))],
		shared_paths: [$paths[] | select(test($medium))],
		tests_changed: any($paths[]; test($tests)),
		failing_checks: [.statusCheckRollup[]?
			| select((.conclusion // .state) as $s | ["FAILURE", "ERROR", "TIMED_OUT"] | index($s))
			| (.name // .context)],
		unresolved_fix_here_comments: $fix_here
	}' <<<"$PR_JSON")

DIFF=$(gh pr diff "$PR" --repo "$REPO" \
	| awk '/^diff --git/ { skip = ($0 ~ /yarn\.lock|package-lock\.json|\.snap$/) } !skip' \
	| head -c "$MAX_DIFF_CHARS")

INPUT=$(cat <<EOF
Signals computed from the PR (trusted):
$(jq . <<<"$SIGNALS")

<pr>
Title: $(jq -r .title <<<"$PR_JSON")

Description:
$(jq -r .body <<<"$PR_JSON")

Diff (lockfiles and snapshots omitted, truncated at $MAX_DIFF_CHARS characters):
$DIFF
</pr>
EOF
)

SCHEMA='{"type":"object","properties":{"level":{"type":"string","enum":["Low","Medium","High"]},"reasons":{"type":"array","items":{"type":"string","maxLength":80},"minItems":1,"maxItems":3}},"required":["level","reasons"],"additionalProperties":false}'

RESULT=$(claude -p "$INPUT" \
	--system-prompt "$(cat "$DIR/prompt.md")" \
	--model "$MODEL" \
	--tools "" \
	--strict-mcp-config \
	--setting-sources "" \
	--no-session-persistence \
	--output-format json \
	--json-schema "$SCHEMA")

jq -c \
	--argjson pr "$PR" \
	--arg sha "$(jq -r .headRefOid <<<"$PR_JSON")" \
	--argjson signals "$SIGNALS" '
	def rank: {"Low": 0, "Medium": 1, "High": 2}[.];
	.structured_output as $out
	| [
		(if $signals.unresolved_fix_here_comments > 0 then {level: "Low", reason: "unresolved [fix here] review comment"} else empty end),
		(if ($signals.sensitive_paths | length) > 0 then {level: "Medium", reason: "touches sensitive paths (\($signals.sensitive_paths[0]))"} else empty end),
		(if ($signals.shared_paths | length) > 0 then {level: "Medium", reason: "touches shared code (\($signals.shared_paths[0]))"} else empty end),
		(if $signals.lines_changed > 1000 then {level: "Medium", reason: "large diff (\($signals.lines_changed) lines)"} else empty end)
	] as $caps
	| ([$out.level] + [$caps[].level] | min_by(rank)) as $level
	| {
		pr: $pr,
		sha: $sha,
		level: $level,
		model_level: $out.level,
		reasons: ([$caps[] | select((.level | rank) < ($out.level | rank)) | .reason] + $out.reasons | .[0:3]),
		signals: $signals,
		cost_usd: (.total_cost_usd // 0)
	}' <<<"$RESULT"
