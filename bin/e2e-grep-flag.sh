#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

# Compute the Playwright `--grep` flag for the E2E "Playwright Test" build, adapting the
# group to the E2E files changed on this branch. The build only calls this when it wants
# that adaptive behavior; otherwise it uses TEST_GROUP directly and never runs this script.
#
# Reads (as environment variables):
#   TEST_GROUP        Default group tag, e.g. "@calypso-pr". May be empty.
#   E2E_CHANGED_FILES Optional newline-separated changed-file list. Testing seam; when unset,
#                     falls back to `git diff` against trunk.
#
# Prints the flag to stdout: "--grep=<value>", "--grep-invert=<value>", or "" to run every test.
#
#   - no test/e2e or packages/calypso-e2e change -> keep TEST_GROUP
#   - documentation and package unit-test files do not affect Playwright selection
#   - a changed E2E file is not a Playwright spec (POM, util, config, fixtures,
#     production packages/calypso-e2e code) -> run all tests except @p2, which has its own
#     scheduled job. If every changed non-spec file is P2-only code (see P2_PATH_RE), run
#     TEST_GROUP plus @p2 and any changed specs instead; if P2 code (a P2 spec included) is
#     mixed with other non-spec changes, run all tests.
#   - Playwright specs changed (test/e2e/specs/**/*.spec.ts) -> run TEST_GROUP plus those specs
#     in a single pass. Playwright's `--grep` matches the spec path relative to test/e2e/specs/,
#     so a test selected by both the tag and a changed path runs once.
#
# Run the built-in checks with:  ./bin/e2e-grep-flag.sh --self-test

# Anchored so a future tag such as "@p2-foo" is not skipped by accident.
readonly P2_TAG_GREP='@p2(\s|$)'

# P2-only files. P2 lines in shared files (the accountP2 fixture, p2User secrets) can't be
# matched by path; such a change skips P2 here and relies on the scheduled P2 job.
readonly P2_PATH_RE='(^|/)(p2[/_-]|isolated-block-editor)'

compute_flag() {
	local group="${TEST_GROUP:-}"
	local changed e2e_changed relevant_changed runtime_changed pw_specs grep_value file rel

	changed="${E2E_CHANGED_FILES-$(git diff --name-only refs/remotes/origin/trunk...HEAD)}"
	e2e_changed="$(grep -E "^(test/e2e/|packages/calypso-e2e/)" <<<"$changed" || true)"

	# No E2E changes: keep the group unchanged.
	if [[ -z "$e2e_changed" ]]; then
		[[ -n "$group" ]] && printf -- '--grep=%s' "$group"
		return 0
	fi

	# Documentation and package unit-test files cannot affect Playwright.
	relevant_changed="$(grep -vE '^(test/e2e/|packages/calypso-e2e/)(.*\.md$|docs/)|^packages/calypso-e2e/jest\.config\.js$|^packages/calypso-e2e/src/.*\.test\.ts$' <<<"$e2e_changed" || true)"
	if [[ -z "$relevant_changed" ]]; then
		[[ -n "$group" ]] && printf -- '--grep=%s' "$group"
		return 0
	fi

	# Runtime helpers and configuration can affect any test, so run everything. Skip the P2
	# suite, which has its own scheduled job, unless the change touches P2 code.
	runtime_changed="$(grep -vE '^test/e2e/specs/.*\.spec\.ts$' <<<"$relevant_changed" || true)"
	grep_value="$group"
	if [[ -n "$runtime_changed" ]]; then
		if grep -qvE "$P2_PATH_RE" <<<"$runtime_changed"; then
			# P2 code mixed with other runtime changes: anything may break, P2 included.
			if grep -qE "$P2_PATH_RE" <<<"$relevant_changed"; then
				return 0
			fi

			printf -- '--grep-invert=%s' "$P2_TAG_GREP"
			return 0
		fi

		# Only P2 runtime code changed (e.g. p2-page.ts): P2 alone is affected, so add it.
		grep_value+="|$P2_TAG_GREP"
	fi

	# Keep the group and add the changed specs' paths.
	pw_specs="$(grep -E '^test/e2e/specs/.*\.spec\.ts$' <<<"$relevant_changed" || true)"

	# With no group set the build already runs everything, so keep clear.
	if [[ -z "$group" ]]; then
		return 0
	fi

	# Union the group tag with each changed Playwright spec, addressed by its path relative to
	# test/e2e/specs/. Only "." is regex-special in these paths (verified against the spec tree).
	while IFS= read -r file; do
		[[ -z "$file" ]] && continue
		rel="${file#test/e2e/specs/}"
		grep_value+="|(^|\\s)${rel//./\\.}"
	done <<<"$pw_specs"

	printf -- '--grep=%s' "$grep_value"
}

# Assert compute_flag's output over controlled param states. No git, no TeamCity.
self_test() {
	local fail=0
	check() { # name expected changed [group]
		local group out
		group="${4-@calypso-pr}"
		out="$(TEST_GROUP="$group" E2E_CHANGED_FILES="$3" compute_flag)"
		[[ "$out" == "$2" ]] && echo "ok   - $1" || { echo "FAIL - $1"; fail=1; }
		echo "       group    [$group]"
		echo "       changed  [${3//$'\n'/ | }]"
		echo "       expected [$2]"
		echo "       actual   [$out]"
	}

	local PW=test/e2e/specs/tools/import__sites-squarespace.spec.ts
	local PW2=test/e2e/specs/tools/import__sites-wordpress.spec.ts
	local POM=test/e2e/lib/pages/some-page.ts
	local SHARED=test/e2e/specs/shared/login.ts
	local PW_GREP='--grep=@calypso-pr|(^|\s)tools/import__sites-squarespace\.spec\.ts'
	local NO_P2='--grep-invert=@p2(\s|$)'
	local GROUP_P2='--grep=@calypso-pr|@p2(\s|$)'
	local P2_SPEC=test/e2e/specs/p2/p2__post.spec.ts
	local P2_POM=packages/calypso-e2e/src/lib/pages/p2-page.ts

	# No relevant change: keep the group.
	check "no e2e change keeps group"   "--grep=@calypso-pr" $'client/foo.ts\ndocs/bar.md'
	check "empty change keeps group"    "--grep=@calypso-pr" ""

	# Single-kind changes.
	check "POM/util skips P2"             "$NO_P2" "$POM"
	check "packages/calypso-e2e skips P2" "$NO_P2" "packages/calypso-e2e/src/lib/foo.ts"
	check "pw-base skips P2"              "$NO_P2" "test/e2e/pw-base.ts"
	check "Playwright config skips P2"    "$NO_P2" "test/e2e/playwright.config.ts"
	check "Playwright setup skips P2"     "$NO_P2" "test/e2e/setup/global.ts"
	check "fixture skips P2"              "$NO_P2" "test/e2e/fixtures/site.ts"
	check "flow skips P2"                 "$NO_P2" "test/e2e/flows/signup.ts"
	check "shared spec helper skips P2"   "$NO_P2" "$SHARED"
	check "non-spec file skips P2"        "$NO_P2" "test/e2e/specs/blocks/blocks__core.ts"
	check "double-underscore helper skips P2" "$NO_P2" "test/e2e/specs/shared/api__close-account.ts"
	check "single PW spec unions path"  "$PW_GREP" "$PW"
	check "two PW specs union all" \
		'--grep=@calypso-pr|(^|\s)tools/import__sites-squarespace\.spec\.ts|(^|\s)tools/import__sites-wordpress\.spec\.ts' \
		$'test/e2e/specs/tools/import__sites-squarespace.spec.ts\ntest/e2e/specs/tools/import__sites-wordpress.spec.ts'

	# Playwright-irrelevant E2E changes.
	check "E2E docs keep group" "--grep=@calypso-pr" $'test/e2e/README.md\npackages/calypso-e2e/docs/setup.md'
	check "docs image keeps group" "--grep=@calypso-pr" "test/e2e/docs/files/PWT-extension.webp"
	check "package Jest config keeps group" "--grep=@calypso-pr" "packages/calypso-e2e/jest.config.js"
	check "package unit tests keep group" "--grep=@calypso-pr" "packages/calypso-e2e/src/test/foo.test.ts"
	check "nested package unit tests keep group" "--grep=@calypso-pr" "packages/calypso-e2e/src/lib/utils/test/foo.test.ts"
	check "ignored files + PW union path" "$PW_GREP" $'test/e2e/README.md\npackages/calypso-e2e/src/test/foo.test.ts\ntest/e2e/specs/tools/import__sites-squarespace.spec.ts'

	# Mix-and-match.
	check "PW + POM skips P2"               "$NO_P2" $'test/e2e/specs/tools/import__sites-squarespace.spec.ts\ntest/e2e/lib/pages/some-page.ts'
	check "PW + non-spec skips P2"          "$NO_P2" $'test/e2e/specs/tools/import__sites-squarespace.spec.ts\ntest/e2e/specs/blocks/blocks__core.ts'
	check "ignored + runtime skips P2"      "$NO_P2" $'test/e2e/README.md\npackages/calypso-e2e/src/lib/foo.ts'

	# P2-only changes add the P2 suite to the group; mixed with other runtime changes, run all.
	check "P2 POM adds P2 to group"         "$GROUP_P2" "$P2_POM"
	check "P2 editor adds P2 to group"      "$GROUP_P2" "packages/calypso-e2e/src/lib/components/isolated-block-editor-component.ts"
	check "P2 spec + P2 POM adds P2" \
		'--grep=@calypso-pr|@p2(\s|$)|(^|\s)p2/p2__post\.spec\.ts' \
		"$P2_SPEC"$'\n'"$P2_POM"
	check "P2 POM, empty group runs all"    "" "$P2_POM" ""
	check "POM, empty group skips P2"       "$NO_P2" "$POM" ""
	check "P2 POM + POM runs all"           "" "$P2_POM"$'\n'"$POM"
	check "P2 POM + PW spec unions both" \
		'--grep=@calypso-pr|@p2(\s|$)|(^|\s)tools/import__sites-squarespace\.spec\.ts' \
		"$P2_POM"$'\n'"$PW"
	check "P2 spec + POM runs all"          "" "$P2_SPEC"$'\n'"$POM"
	check "P2 spec alone unions path" \
		'--grep=@calypso-pr|(^|\s)p2/p2__post\.spec\.ts' \
		"$P2_SPEC"
	check "p2 substring is not P2 code"     "$NO_P2" "test/e2e/lib/pages/mp2-page.ts"

	# Group edge cases.
	check "PW spec, empty group runs all" "" "$PW" ""
	check "release group unions" \
		'--grep=@calypso-release|(^|\s)blocks/blocks__media\.spec\.ts' \
		"test/e2e/specs/blocks/blocks__media.spec.ts" "@calypso-release"

	# Each spec path is anchored with (^|\s) so a shorter path can't match a longer
	# one by suffix, e.g. changed.spec.ts must not select unchanged.spec.ts.
	check "spec path is anchored" \
		'--grep=@calypso-pr|(^|\s)a/changed\.spec\.ts' \
		"test/e2e/specs/a/changed.spec.ts"

	return $fail
}

if [[ "${1:-}" == "--self-test" ]]; then
	self_test
	exit
fi

compute_flag
