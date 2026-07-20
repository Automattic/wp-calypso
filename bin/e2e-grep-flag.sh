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
# Prints the flag to stdout: "--grep=<value>", or "" to run every test.
#
#   - no test/e2e or packages/calypso-e2e change -> keep TEST_GROUP
#   - documentation and Jest-only files do not affect Playwright selection
#   - a changed E2E file is neither a Playwright spec nor a legacy Jest spec (POM, util,
#     config, fixtures, production packages/calypso-e2e code) -> clear the group, run all tests
#   - only legacy Jest specs changed (test/e2e/specs/**/*__*.ts) -> keep TEST_GROUP;
#     these run via the Jest runner, not test:pw, so they don't affect Playwright selection
#   - Playwright specs changed (test/e2e/specs/**/*.spec.ts) -> run TEST_GROUP plus those specs
#     in a single pass. Playwright's `--grep` matches the spec path relative to test/e2e/specs/,
#     so a test selected by both the tag and a changed path runs once.
#
# Run the built-in checks with:  ./bin/e2e-grep-flag.sh --self-test

compute_flag() {
	local group="${TEST_GROUP:-}"
	local changed e2e_changed relevant_changed pw_specs grep_value file rel

	changed="${E2E_CHANGED_FILES-$(git diff --name-only refs/remotes/origin/trunk...HEAD)}"
	e2e_changed="$(grep -E "^(test/e2e/|packages/calypso-e2e/)" <<<"$changed" || true)"

	# No E2E changes: keep the group unchanged.
	if [[ -z "$e2e_changed" ]]; then
		[[ -n "$group" ]] && printf -- '--grep=%s' "$group"
		return 0
	fi

	# Documentation and Jest-only infrastructure cannot affect Playwright.
	relevant_changed="$(grep -vE '^(test/e2e/|packages/calypso-e2e/).*\.md$|^test/e2e/jest\.config\.js$|^test/e2e/jest-helpers/|^packages/calypso-e2e/jest\.config\.js$|^packages/calypso-e2e/src/(jest-playwright-config|test)/' <<<"$e2e_changed" || true)"
	if [[ -z "$relevant_changed" ]]; then
		[[ -n "$group" ]] && printf -- '--grep=%s' "$group"
		return 0
	fi

	# Runtime helpers and configuration can affect any test, so run everything. Legacy Jest
	# specs are identified by their *__*.ts convention; other .ts files under specs are helpers.
	if grep -qvE '^test/e2e/specs/.*(\.spec\.ts|__[^/]*\.ts)$' <<<"$relevant_changed"; then
		return 0
	fi

	# Only Playwright or legacy Jest specs changed. Legacy Jest specs run under Jest, not test:pw,
	# so keep the group and add just the changed Playwright specs (if any).
	pw_specs="$(grep -E '^test/e2e/specs/.*\.spec\.ts$' <<<"$relevant_changed" || true)"
	if [[ -z "$pw_specs" ]]; then
		[[ -n "$group" ]] && printf -- '--grep=%s' "$group"
		return 0
	fi

	# With no group set the build already runs everything, so keep clear.
	if [[ -z "$group" ]]; then
		return 0
	fi

	# Union the group tag with each changed Playwright spec, addressed by its path relative to
	# test/e2e/specs/. Only "." is regex-special in these paths (verified against the spec tree).
	grep_value="$group"
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
	local JEST=test/e2e/specs/blocks/blocks__core.ts
	local POM=test/e2e/lib/pages/some-page.ts
	local SHARED=test/e2e/specs/shared/login.ts
	local PW_GREP='--grep=@calypso-pr|(^|\s)tools/import__sites-squarespace\.spec\.ts'

	# No relevant change: keep the group.
	check "no e2e change keeps group"   "--grep=@calypso-pr" $'client/foo.ts\ndocs/bar.md'
	check "empty change keeps group"    "--grep=@calypso-pr" ""

	# Single-kind changes.
	check "POM/util clears group"       "" "$POM"
	check "packages/calypso-e2e clears" "" "packages/calypso-e2e/src/lib/foo.ts"
	check "pw-base clears group"        "" "test/e2e/pw-base.ts"
	check "Playwright config clears"    "" "test/e2e/playwright.config.ts"
	check "Playwright setup clears"     "" "test/e2e/setup/global.ts"
	check "fixture clears group"        "" "test/e2e/fixtures/site.ts"
	check "flow clears group"           "" "test/e2e/flows/signup.ts"
	check "shared spec helper clears"   "" "$SHARED"
	check "single Jest spec keeps group" "--grep=@calypso-pr" "$JEST"
	check "two Jest specs keep group"    "--grep=@calypso-pr" $'test/e2e/specs/blocks/blocks__core.ts\ntest/e2e/specs/me/me__account.ts'
	check "single PW spec unions path"  "$PW_GREP" "$PW"
	check "two PW specs union all" \
		'--grep=@calypso-pr|(^|\s)tools/import__sites-squarespace\.spec\.ts|(^|\s)tools/import__sites-wordpress\.spec\.ts' \
		$'test/e2e/specs/tools/import__sites-squarespace.spec.ts\ntest/e2e/specs/tools/import__sites-wordpress.spec.ts'

	# Playwright-irrelevant E2E changes.
	check "E2E docs keep group" "--grep=@calypso-pr" $'test/e2e/README.md\npackages/calypso-e2e/docs/setup.md'
	check "Jest config keeps group" "--grep=@calypso-pr" $'test/e2e/jest.config.js\npackages/calypso-e2e/jest.config.js'
	check "Jest helpers keep group" "--grep=@calypso-pr" "test/e2e/jest-helpers/setup.ts"
	check "package unit tests keep group" "--grep=@calypso-pr" "packages/calypso-e2e/src/test/foo.test.ts"
	check "Jest Playwright config keeps group" "--grep=@calypso-pr" "packages/calypso-e2e/src/jest-playwright-config/index.ts"
	check "ignored files + PW union path" "$PW_GREP" $'test/e2e/README.md\npackages/calypso-e2e/src/test/foo.test.ts\ntest/e2e/specs/tools/import__sites-squarespace.spec.ts'

	# Mix-and-match.
	check "PW + Jest unions PW only"        "$PW_GREP" $'test/e2e/specs/tools/import__sites-squarespace.spec.ts\ntest/e2e/specs/blocks/blocks__core.ts'
	check "PW + POM clears group"           "" $'test/e2e/specs/tools/import__sites-squarespace.spec.ts\ntest/e2e/lib/pages/some-page.ts'
	check "Jest + POM clears group"         "" $'test/e2e/specs/blocks/blocks__core.ts\ntest/e2e/lib/pages/some-page.ts'
	check "PW + Jest + POM clears group"    "" $'test/e2e/specs/tools/import__sites-squarespace.spec.ts\ntest/e2e/specs/blocks/blocks__core.ts\ntest/e2e/lib/pages/some-page.ts'
	check "ignored + runtime clears group"  "" $'test/e2e/README.md\npackages/calypso-e2e/src/lib/foo.ts'

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
