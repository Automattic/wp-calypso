# Linking from and to the Dashboard

## Link components

- Links to Dashboard routes use `RouterLink` (`client/dashboard/components/router-link`), which renders the design system's `Link` as a TanStack Router link.
- Other text links use `Link` from `@wordpress/ui`. A link that opens a new tab passes `openInNewTab`, which adds the external icon and its label. Don't use `ExternalLink` from `@wordpress/components`.
- Links styled as buttons use `RouterLinkButton` or `Button` with an `href`.

```tsx
<RouterLink to="/me/purchases">View purchases</RouterLink>

<Link href={ wpcomLink( '/start' ) }>Create new site</Link>

<Link href="https://wordpress.com/support/" openInNewTab>
	Learn more
</Link>
```

## URLs

- Every relative URL from the dashboard linking to the Classic WordPress.com/Calypso MUST use `wpcomLink()` function
  - **Purpose**: Ensures proper environment configuration (dev vs production hostnames)

```typescript
// ✅ Correct - wrapped with wpcomLink()
<Link href={ wpcomLink( '/start' ) }>Create new site</Link>

// ❌ Incorrect - hardcoded WordPress.com URL
<Link href="https://wordpress.com/start">Create new site</Link>

// ❌ Incorrect - relative URL to Calypso
<Link href="/start">Create new site</Link>
```

- Every relative URL from the Classic WordPress.com/Calypso to the dashboard MUST use `dashboardLink()` function
  - **Purpose**: Ensures proper environment configuration (dev vs production hostnames)
- Every link to `/checkout` must have `redirect_to` and `cancel_to` query param
  - **Purpose**: Ensures correct behaviour when exiting the checkout screen
- Every link to `/setup/plan-upgrade` must have a `cancel_to` query param
  - **Purpose**: Ensures correct behaviour when exiting the upgrade screen
