# Dashboard Code Review

Review the provided code for WordPress.com Dashboard compliance.

## Checklist

### 1. External Link Handling
- [ ] All URLs linking to non-Dashboard routes use `wpcomLink()` from `client/dashboard/utils/link`
- [ ] `/checkout` links have `redirect_to` and `cancel_to` params
- [ ] `/setup/plan-upgrade` links have `cancel_to` param

### 2. Mutation Callbacks
- [ ] `onSuccess`/`onError` are on `mutate()` call, not `useMutation()`
- [ ] Query option callbacks are not overridden

### 3. Typography and Copy
- [ ] Buttons/labels use sentence case (not Title Case)
- [ ] Sentences end with periods; buttons/labels do not
- [ ] Curly quotes and proper apostrophes used
- [ ] "Hosting Dashboard" capitalized as proper noun

### 4. Snackbar Messages
- [ ] Follow pattern: `Action completed.` or `Failed to do action.`

## Instructions

1. Search the provided files for hardcoded WordPress.com URLs
2. Check mutation patterns against the documented approach
3. Review all user-facing copy for typography compliance
4. Report findings with specific file:line references

Reference docs if needed:
- client/dashboard/docs/data-library.md
- client/dashboard/docs/ui-components.md
- client/dashboard/docs/typography-and-copy.md
