---
name: dashboard-review
description: Review code for WordPress.com Dashboard compliance. Use when reviewing dashboard code, checking for wpcomLink() usage, mutation callback patterns, typography standards, or when asked to review dashboard PRs.
allowed-tools: Read, Grep, Glob
---

# Dashboard Code Review

Review code in `client/dashboard/` for compliance with dashboard coding standards.

## Review Checklist

### 1. External Link Handling

All URLs linking to non-Dashboard routes MUST use `wpcomLink()` from `client/dashboard/utils/link`.

**Checkout and upgrade links** (always use `wpcomLink()`):
- `/checkout` must have `redirect_to` and `cancel_to` query params
- `/setup/plan-upgrade` must have `cancel_to` query param

### 2. Mutation Callback Handling

Component-specific `onSuccess`/`onError` callbacks belong on the `mutate()` call, NOT `useMutation()`:

```typescript
// Correct - callback on mutate call
const { mutate: saveSetting } = useMutation( saveSettingMutation() );

const handleSave = () => {
  saveSetting( newValue, {
    onSuccess: () => setShowSuccessMessage( true ),
    onError: ( error ) => setError( error.message ),
  } );
};

// Incorrect - overrides query option callbacks, breaks cache updates
const { mutate: saveSetting } = useMutation( {
  ...saveSettingMutation(),
  onSuccess: () => setShowSuccessMessage( true ),
} );
```

### 3. Typography and Copy

- **Sentence case**: Buttons, labels, and headings use sentence case (not Title Case)
- **Periods**: Sentences end with periods; buttons and labels do not
- **Quotes**: Use curly quotes ("like this") and proper apostrophes (it's)
- **Product names**: "Hosting Dashboard" is capitalized as a proper noun

```typescript
// Correct
<Button>Save changes</Button>
<p>Your settings have been saved.</p>

// Incorrect
<Button>Save Changes.</Button>  // Title case + period
<p>Your settings have been saved</p>  // Missing period
```

### 4. Snackbar Message Patterns

```typescript
// Success messages
`SSH access enabled.`
`Settings saved.`

// Error messages
`Failed to save PHP version.`
`Could not enable SSH access.`
```

## Reference Documentation

For detailed implementation guidance, consult:
- [Data Library](client/dashboard/docs/data-library.md) - TanStack Query usage, loaders, caching
- [UI Components](client/dashboard/docs/ui-components.md) - WordPress components, placeholders, DataViews
- [Router](client/dashboard/docs/router.md) - TanStack Router patterns, lazy loading
- [Internationalization](client/dashboard/docs/i18n.md) - Translation patterns, CSS logical properties
- [Typography and Copy](client/dashboard/docs/typography-and-copy.md) - Capitalization, snackbar messages
- [Testing](client/dashboard/docs/testing.md) - Testing strategies

## Review Process

1. **Grep for potential issues**: Search for hardcoded WordPress.com URLs, `useMutation` with inline callbacks
2. **Check imports**: Verify `wpcomLink` is imported where external links are used
3. **Review copy**: Check button text, labels, and messages for sentence case and proper punctuation
4. **Validate patterns**: Compare mutation usage against documented patterns
