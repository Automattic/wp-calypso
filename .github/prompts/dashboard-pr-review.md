# Code Review Instructions

## Primary Objective

Review the PR based on the below guidelines.

Consult @client/dashboard/AGENTS.md if you need more information.

## Method

- Use `mcp__github_inline_comment__create_inline_comment` to post feedback directly on specific lines.
- Provide fix suggestions in each comment.
- Don't nitpick minor style issues unless they violate project guidelines.
- Before suggesting alternative implementations, check if the PR description already addresses why that approach wasn't used.

## Output Format

- Be concise.
- Do NOT use checkboxes, todo lists, or progress indicators.
- Only comment if there are issues worth addressing.
- DO NOT comment on lines that are not related to the below guidelines.

## Code Review Guidelines

When reviewing dashboard code, watch for these specific patterns and potential issues:

### External Link Handling

- All URLs linking to old WordPress.com/Calypso MUST use `wpcomLink()` function
    - **Import**: Use `import { wpcomLink } from '@automattic/dashboard/utils/link'`
    - **Purpose**: Ensures proper environment configuration (dev vs production hostnames)
- Every link to `/checkout` must have `redirect_to` and `cancel_to` query param
    - **Purpose**: Ensures correct behaviour when exiting the checkout screen
- Every link to `/setup/plan-upgrade` must have a `cancel_to` query param
    - **Purpose**: Ensures correct behaviour when exiting the upgrade screen

```typescript
// ✅ Correct - wrapped with wpcomLink()
<a href={ wpcomLink( '/me/security' ) }>Security Settings</a>

// ❌ Incorrect - hardcoded WordPress.com URL
<a href="https://wordpress.com/me/security">Security Settings</a>

// ❌ Incorrect - relative URL to old dashboard
<a href="/me/security">Security Settings</a>
```

### Mutation Callback Handling

- **Component-specific Callbacks**: Attach `onSuccess`/`onError` to the `mutate()` call, not `useMutation()`
- **Query Options**: Don't override callbacks defined in api-queries mutation options
- **Cache Updates**: Query option callbacks handle cache invalidation and updates

```typescript
// ✅ Correct - callback on mutate call
const { mutate: saveSetting } = useMutation( saveSettingMutation() );

const handleSave = () => {
  saveSetting( newValue, {
    onSuccess: () => {
      // Component-specific success handling
      setShowSuccessMessage( true );
    },
    onError: ( error ) => {
      // Component-specific error handling
      setError( error.message );
    },
  } );
};

// ❌ Incorrect - overrides query option callbacks
const { mutate: saveSetting } = useMutation( {
  ...saveSettingMutation(),
  onSuccess: () => setShowSuccessMessage( true ), // Breaks cache updates!
  onError: ( error ) => setError( error.message ),
} );
```

### Typography and Copy Compliance

- **Sentence Case**: Verify buttons, labels, and headings use sentence case (not title case)
- **Periods**: Check sentences end with periods; buttons and labels do not
- **Curly Quotes**: Ensure proper curly quotes (“like this”) and apostrophes (it’s) are used
- **Product Names**: "Hosting Dashboard" should be capitalized as proper noun
- **Snackbar Patterns**: Follow established patterns for success/error messages

```typescript
// ✅ Correct copy patterns
<Button>Save changes</Button>  // No period, sentence case
<p>Your settings have been saved.</p>  // Period, curly quotes if needed

// Snackbar messages
`SSH access enabled.`
`Failed to save PHP version.`

// ❌ Incorrect patterns
<Button>Save Changes.</Button>  // Has period, title case
<p>Your settings have been saved</p>  // Missing period
`SSH Access Enabled`  // Title case, missing period
```

Remember: This dashboard represents modern React patterns. Prioritize performance, accessibility, and maintainability while leveraging the WordPress ecosystem.
