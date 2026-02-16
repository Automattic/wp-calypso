#!/bin/bash
# PostToolUse hook: checks if an Edit replaced unicode chars with ASCII equivalents.
# Reads Edit tool_input from stdin JSON.

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
  old_unicode=$(echo "$OLD_STRING" | grep -o "$char" | wc -l | tr -d ' ')
  new_unicode=$(echo "$NEW_STRING" | grep -o "$char" | wc -l | tr -d ' ')
  old_ascii=$(echo "$OLD_STRING" | grep -o "$ascii_equivalent" | wc -l | tr -d ' ')
  new_ascii=$(echo "$NEW_STRING" | grep -o "$ascii_equivalent" | wc -l | tr -d ' ')

  # Unicode count decreased AND ASCII equivalent count increased → downgrade
  if [[ "$old_unicode" -gt 0 && "$new_unicode" -lt "$old_unicode" && "$new_ascii" -gt "$old_ascii" ]]; then
    echo "$label ($char) was replaced with its ASCII equivalent ($ascii_equivalent). Preserve unicode characters exactly." >&2
    return 1
  fi
  return 0
}

FAILED=0

check_char "Right single quote" $'\u2019' "'" || FAILED=1
check_char "Left single quote"  $'\u2018' "'" || FAILED=1
check_char "Right double quote" $'\u201C' '"' || FAILED=1
check_char "Left double quote"  $'\u201D' '"' || FAILED=1
check_char "Em-dash"            $'\u2014' "-" || FAILED=1
check_char "En-dash"            $'\u2013' "-" || FAILED=1
check_char "Ellipsis"           $'\u2026' "." || FAILED=1

if [[ "$FAILED" -eq 1 ]]; then
  echo "FIX: re-run the Edit preserving the original unicode characters." >&2
  exit 2
fi

exit 0
