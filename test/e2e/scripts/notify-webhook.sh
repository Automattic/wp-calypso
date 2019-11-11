#!/bin/bash
set +o errexit
curl -X POST "https://a8c-gh-e2e-bridge.go-vip.co/circleciwebhook" \
    -H 'Cache-Control: no-cache'                                                   \
    -H 'Content-Type: application/json'                                            \
    -d '{
            "payload": {
                "outcome": "'"$1"'",
                "status": "'"$1"'",
                "build_url": "'"$CIRCLE_BUILD_URL"'",
                "build_parameters": {
                    "branch": "'"$BRANCHNAME"'",
                    "build_num": '"$CIRCLE_BUILD_NUM"',
                    "sha": "'"$sha"'",
                    "prContext": "'"$prContext"'",
                    "calypsoProject": "'"$calypsoProject"'",
                    "jetpackProject": "'"$jetpackProject"'"
                }
            }
        }'
