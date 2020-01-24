#!/bin/sh
FILES_TO_LINT=$(
  git diff --name-only --diff-filter=d origin/master... \
    | grep -E '^(client/|server/|packages/)'            \
    | grep -E '\.[jt]sx?$'
) || exit 0

if [[ ! -z $FILES_TO_LINT ]]; then
  ./node_modules/.bin/eslint $FILES_TO_LINT
fi