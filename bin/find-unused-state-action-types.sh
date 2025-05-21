#!/usr/bin/env bash

# This script checks to ensure that all defined Redux action types are being used in files where
# they are expected to be used. It does so by grepping for all action types in the action-types.ts
# file and then checking if any relevant files in the client/state directory use that action type.

if [ ! -f "client/state/action-types.ts" ]; then
    echo "Action types file not found"
    exit 1
fi

grep "export const [A-Z_]* =" client/state/action-types.ts | \
    sed -E 's/export const ([A-Z_]+) =.*/\1/' | \
    xargs -P 8 -I{} sh -c \
    'find client/state \
        \( \
           -path "*/actions/*" \
           -o -name "reducer.[jt]s" \
           -o -name "actions.[jt]s" \
           -o -name "index.[jt]s" \
           -o -name "middleware.[jt]s" \
           -o -name "reducer-utils.ts" \
        \) \
        -type f \
        -not -path "*/test/*" \
        -print0 | xargs -0 grep -q "$1" || (echo "Unexpected unused action type: $1"; exit 1)' _ {}
