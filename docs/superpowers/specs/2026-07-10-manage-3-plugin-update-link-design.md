# MANAGE-3: Restore the Jetpack Manage plugin update link

## Context

[MANAGE-3](https://linear.app/a8c/issue/MANAGE-3/plugin-update-link-inactive) reports that the Plugins status on the Jetpack Cloud Sites screen does not respond when updates are available. The linked [support discussion](https://a8c.slack.com/archives/C0CMN0V97/p1760629206209709) confirms that the user was trying to reach Jetpack's plugin-management experience for an Atomic site.

The Sites table currently produces two destinations:

- Atomic sites open the site's external `wp-admin/plugins.php` page.
- Other sites with updates open `/plugins/updates/:site`, which Jetpack Cloud does not register.

Jetpack Cloud already has a working `/plugins/manage/:site` route. The site preview's “Manage plugins” action uses that route, and the plugin-management screen supports updating eligible plugins on Atomic and Jetpack-connected sites.

## Decision

All enabled Plugins status links in the Sites table will open the site-specific plugin manager inside Jetpack Cloud, regardless of Atomic classification. Statuses that report available updates will add an `updates=1` query parameter so the destination can initialize its update filter.

This removes the obsolete routing split and keeps the user in the product described by the support documentation. Existing permission and plugin-management rules remain responsible for deciding which actions are available after navigation.

## Scope

- Route plugin statuses to the existing internal management route and preserve update intent in the query string.
- Run site selection on Jetpack Cloud's `/plugins/manage/:site` route.
- Scope plugin aggregation to the selected site when the route has a site parameter.
- Initialize the DataView status filter when the link requests available updates.
- Update the focused metadata and rendered-table regression tests.
- Add explicit Atomic coverage so the old external redirect cannot return unnoticed.
- Preserve the current Tracks event, tooltip, disabled-state behavior, and all non-plugin destinations.

No new route, UI, translated string, API request, or permission rule is required.

## Status-label polish

The plugin warning label will describe the actionable object as “1 Update” or “N Updates” instead of “N Available.” Its link will use the same warning color for both the text and underline in default, visited, hover, focus, and active states. This is limited to warning-status links so other feature links keep their existing visual treatment.

## Data flow

1. The Sites table formats a plugin status row.
2. `useRowMetadata` asks `getLinks` for the destination.
3. `getLinks` returns `/plugins/manage/:site?updates=1` for an update warning.
4. Jetpack Cloud's plugin-management router selects the requested site and passes the update intent to the plugin dashboard.
5. The dashboard aggregates plugins only for the selected site.
6. The DataView initializes its status filter to “Update available.”
7. The dashboard exposes update actions when the existing capability checks allow them.

## Testing

Use test-driven development:

1. Change or add assertions for update-available and Atomic plugin rows to expect `/plugins/manage/:site?updates=1` and `isExternalLink: false`.
2. Run the focused test first and confirm it fails against the current implementation.
3. Add focused coverage for update-intent propagation and the DataView's initial filter.
4. Apply the routing, site-selection, aggregation, and filter changes.
5. Run the focused metadata, controller, selector, DataView, and table tests, followed by lint/type checks scoped to the changed files where supported.
6. Start Jetpack Cloud locally with `yarn start-jetpack-cloud` and verify that clicking an “Available” Plugins status opens only that site's plugins with the update filter active.
