#!/bin/bash

_project=$1
_branch=$2
_circle_token=$3
_e2e_branch=$4
_browsers=$5

trigger_build_url=https://circleci.com/api/v1/project/${_project}/tree/${_branch}?circle-token=${_circle_token}

post_data=$(cat <<EOF
{
  "build_parameters": {
    "E2E_BRANCH": "${_e2e_branch}",
    "BROWSERS": "${_browsers}"
  }
}
EOF)

curl \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
--data "${post_data}" \
--request POST ${trigger_build_url}
