# Unicode Preservation

When editing code, **preserve Unicode characters in string literals exactly as written**. These are intentional.

- Do NOT replace curly quotes `“` `”` `‘` `’` with straight quotes `"` `'`
- Do NOT replace `…` (ellipsis) with `...` or `\u2026`
- Do NOT replace `—` (em-dash) or `–` (en-dash) with `--` or `-`
- Do NOT escape or normalize any Unicode characters that already exist in the source

