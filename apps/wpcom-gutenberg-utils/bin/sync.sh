#!/usr/bin/env bash

INCLUDE=(
  "build"
  "gutenberg.php"
  "lib"
  "packages"
  "post-content.php"
  "vendor"
)

EXCLUDE=(
  "node_modules"
  "react-native*"
  "project-management-automation"
  "*test*"
  "*.md"
  "*.MD"
  ".*"
  # What else can we exclude to speed it up?
)

for i in "${!INCLUDE[@]}"; do
  INCLUDE[$i]="$LOCAL_PATH/${INCLUDE[$i]}"
done

for i in "${!EXCLUDE[@]}"; do
  EXCLUDE[$i]="--exclude='${EXCLUDE[$i]}'"
done

SYNC_CMD="rsync -ahz ${EXCLUDE[@]} ${INCLUDE[@]} $REMOTE_SSH:$REMOTE_PATH/ --verbose"

npx chokidar "$LOCAL_PATH/**" \
  --debounce 1000 \
  --throttle 10000 \
  --initial \
  --silent \
  -c "$SYNC_CMD && printf '\n'"
