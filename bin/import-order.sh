#!/usr/bin/env bash

# Script to help transition from `wpcalypso/import-docblock` to `import/order` (see p4TIVU-9Hd-p2).
#
# Usage:
#   1. Select a directory you want to refactor. For example, `packages/foo`
#   2. Add `packages/foo/**/*` to `.eslintrc`, to the override for `wpcalypso/import-docblock` section
#   3. Run `./bin/import-order.sh packages/foo`
#   4. Review the result and commit it.
#   5. Repeat until the whole repo is converted.
set -eou pipefail

DIR="$1"

function removeComments {
	perl -0777 -pi -e "s/\/\*\*\n \* (External|Internal|WordPress|Module|Type|Image|Style) dependencies(\n \*)+\///gi" "$1"
}

function prettify {
	./node_modules/.bin/prettier  --write "$1"
}
function fix {
	npx eslint-filtered-fix --rule import/order --ext .js,.jsx,.ts,.tsx "$1"
}

while IFS= read -r -d '' file
do
	echo Remving comments from $file
	removeComments "$file"
done < <(find -E "$DIR" -type f -regex '.*\.([jt]sx?|md)' -not -path "./node_modules/*" -not -path "*/node_modules/*" -print0)

echo Running eslint
fix "$DIR"

echo Running prettify
prettify "$DIR"
