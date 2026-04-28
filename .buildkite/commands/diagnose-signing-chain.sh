#!/usr/bin/env bash

# Run the `diagnose_signing_chain` fastlane lane against each of the
# three KEYCHAIN_FIX variants in sequence. Each variant runs in its own
# `fastlane` invocation so they don't share state beyond what the VM
# itself persists.
#
# `set -e` is intentionally omitted — the `none` variant is expected
# to fail at the codesign step, and we want the script to keep going
# so we collect logs from all three variants in one job.

set -uo pipefail

export RBENV_VERSION=3.3.4

cd desktop
bundle install

run_variant() {
  local variant="$1"
  echo
  echo "============================================================"
  echo "BEGIN VARIANT: KEYCHAIN_FIX=$variant"
  echo "============================================================"

  if KEYCHAIN_FIX="$variant" bundle exec fastlane diagnose_signing_chain; then
    echo "[diagnose] variant=$variant fastlane exit=0"
  else
    echo "[diagnose] variant=$variant fastlane exit=$?"
  fi

  echo "============================================================"
  echo "END VARIANT: KEYCHAIN_FIX=$variant"
  echo "============================================================"
}

run_variant none
run_variant search-list
run_variant cert-import
