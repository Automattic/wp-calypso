#!/bin/bash
# PostToolUse hook: checks if an Edit replaced unicode chars with ASCII equivalents.
# Reads Edit tool_input from stdin JSON.

# jq is required to parse tool input; skip hook if unavailable
command -v jq >/dev/null 2>&1 || exit 0

INPUT=$(cat)

OLD_STRING=$(echo "$INPUT" | jq -r '.tool_input.old_string // empty')
NEW_STRING=$(echo "$INPUT" | jq -r '.tool_input.new_string // empty')

if [[ -z "$OLD_STRING" || -z "$NEW_STRING" ]]; then
  exit 0
fi

# Flag only when a unicode char was *replaced* with its ASCII equivalent,
# not when the text containing it was simply removed.
check_char() {
  local label="$1" char="$2" ascii_equivalent="$3"

  local old_unicode new_unicode old_ascii new_ascii
  old_unicode=$(echo "$OLD_STRING" | grep -oF "$char" | wc -l | tr -d ' ')
  new_unicode=$(echo "$NEW_STRING" | grep -oF "$char" | wc -l | tr -d ' ')
  old_ascii=$(echo "$OLD_STRING" | grep -oF "$ascii_equivalent" | wc -l | tr -d ' ')
  new_ascii=$(echo "$NEW_STRING" | grep -oF "$ascii_equivalent" | wc -l | tr -d ' ')

  # Unicode count decreased AND ASCII equivalent count increased → downgrade
  if [[ "$old_unicode" -gt 0 && "$new_unicode" -lt "$old_unicode" && "$new_ascii" -gt "$old_ascii" ]]; then
    echo "$label ($char) was replaced with its ASCII equivalent ($ascii_equivalent). Preserve unicode characters exactly." >&2
    return 1
  fi
  return 0
}

FAILED=0

# Use printf for unicode literals to avoid bash version incompatibilities.
# Bash 3.2 (macOS default /bin/bash) does not support $'\uXXXX' escapes.
RIGHT_SINGLE_QUOTE=$(printf '\xe2\x80\x99')
LEFT_SINGLE_QUOTE=$(printf '\xe2\x80\x98')
RIGHT_DOUBLE_QUOTE=$(printf '\xe2\x80\x9c')
LEFT_DOUBLE_QUOTE=$(printf '\xe2\x80\x9d')
EM_DASH=$(printf '\xe2\x80\x94')
EN_DASH=$(printf '\xe2\x80\x93')
ELLIPSIS=$(printf '\xe2\x80\xa6')

check_char "Right single quote" "$RIGHT_SINGLE_QUOTE" "'" || FAILED=1
check_char "Left single quote"  "$LEFT_SINGLE_QUOTE"  "'" || FAILED=1
check_char "Right double quote" "$RIGHT_DOUBLE_QUOTE"  '"' || FAILED=1
check_char "Left double quote"  "$LEFT_DOUBLE_QUOTE"   '"' || FAILED=1
check_char "Em-dash"            "$EM_DASH"             "-" || FAILED=1
check_char "En-dash"            "$EN_DASH"             "-" || FAILED=1
check_char "Ellipsis"           "$ELLIPSIS"            "." || FAILED=1

if [[ "$FAILED" -eq 1 ]]; then
  echo "FIX: re-run the Edit preserving the original unicode characters." >&2
  exit 2
fi

exit 0
