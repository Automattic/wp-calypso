#!/usr/bin/env bash

# This script checks to ensure that all defined Redux action types are being used in files where
# they are expected to be used. It does so by grepping for all action types in the action-types.ts
# file and then checking if any relevant files in the client/state directory use that action type.

grep -r "export const [A-Z_]* =" client/state/action-types.ts | \
    sed -E 's/.*export const ([A-Z_]+) =.*/\1/' | \
    xargs -n 1 -P 8 -I{} sh -c \
    'grep -rq --include="*/actions/*" \
                --include="reducer.js" \
                --include="reducer.ts" \
                --include="actions.js" \
                --include="actions.ts" \
                --include="index.js" \
                --include="index.ts" \
                --include="middleware.js" \
                --include="middleware.ts" \
                --include="reducer-utils.ts" \
                --exclude-dir="test" "$1" client/state || (echo "Unexpected unused action type: $1"; exit 1)' _ {}
