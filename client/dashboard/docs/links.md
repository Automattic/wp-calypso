# Linking from and to the Dashboard

- Every relative URL from the dashboard linking to the Classic WordPress.com/Calypso MUST use `wpcomLink()` function
    - **Purpose**: Ensures proper environment configuration (dev vs production hostnames)

```typescript
// ✅ Correct - wrapped with wpcomLink()
<a href={ wpcomLink( '/start' ) }>Create new site</a>

// ❌ Incorrect - hardcoded WordPress.com URL
<a href="https://wordpress.com/start">Create new site</a>

// ❌ Incorrect - relative URL to Calypso
<a href="/start">Create new site</a>
```

- Every relative URL from the Classic WordPress.com/Calypso to the dashboard MUST use `dashboardLink()` function
    - **Purpose**: Ensures proper environment configuration (dev vs production hostnames)
- Every link to `/checkout` must have `redirect_to` and `cancel_to` query param
    - **Purpose**: Ensures correct behaviour when exiting the checkout screen
- Every link to `/setup/plan-upgrade` must have a `cancel_to` query param
    - **Purpose**: Ensures correct behaviour when exiting the upgrade screen
