#!/usr/bin/env bash

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
