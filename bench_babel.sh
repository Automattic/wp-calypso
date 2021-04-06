#!/bin/bash

set errexit
set nounset

echo 'Benchmarking build, cold cache…'
hyperfine \
  --export-markdown 'cold.md' \
  --export-json 'cold.json' \
  --prepare 'rm -fr .cache' \
  --parameter-list var "yes","" \
  'CALYPSO_ENV="production" DISABLE_BABEL_CACHE_COMPRESSION="{var}" yarn build'
echo
echo
echo

echo 'Benchmarking build, hot (babel) cache…'
hyperfine \
  --export-markdown 'hot.md' \
  --export-json 'hot.json' \
  --warmup 1 \
  --parameter-list var "yes","" \
  'CALYPSO_ENV="production" DISABLE_BABEL_CACHE_COMPRESSION="{var}" yarn build'
echo
echo
echo

say "Benchmarking completed"
