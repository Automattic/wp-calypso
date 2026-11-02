# Dashboard Omnibar

This is the WordPress.com integration of the omnibar: it fetches the admin bar data, customizes nodes, adds client-side nodes, and renders the result with `@automattic/omnibar`.

## Data sources

There are two admin bar queries from `@automattic/api-queries`:

- **`dashboardAdminBarQuery()`** — `GET wpcom/v2/dashboard/admin-bar`. The admin bar as if the user were on WordPress.com itself, with no site context. It serves the global pages (`/sites`, `/me`, …).
- **`siteAdminBarQuery( siteId )`** — `GET wpcom/v2/sites/:siteId/admin-bar`. The admin bar as rendered on that site's wp-admin, including the site-specific nodes that end up in the `site` and `siteNodes` slots.

The current site is held in `omnibarSiteIdQuery()`, a client-only query that the host app writes with `queryClient.setQueryData` (`null` means no site).

### Which admin bar each page uses

- **Global Dashboard pages, and Calypso pages without a site (e.g. Reader)**: only the dashboard admin bar is used.
- **Dashboard site-specific pages**: both are merged (`preferDashboardAdminBar`). `preferDashboardAdminBarNodes()` takes the `wp-logo` and `top-secondary` subtrees from the dashboard admin bar and everything else from the site admin bar, so the home and user menus match the global pages while the site menu and site nodes come from the site.
- **Calypso site-specific pages**: only the site admin bar is used, as-is.

## Who owns which slot

- **`siteNodes`** are backend-driven: they render in whatever set and order the site admin bar sends.
- **`userNodes`** are mainly controlled by the client: `omnibar.tsx` rebuilds them in a fixed order, adding client-only nodes (language switcher, cart) to the backend's (Reader, Help Center, notifications).
