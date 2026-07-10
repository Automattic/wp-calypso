# MANAGE-3: Restore the Jetpack Manage plugin update link

## Context

[MANAGE-3](https://linear.app/a8c/issue/MANAGE-3/plugin-update-link-inactive) reports that the Plugins status on the Jetpack Cloud Sites screen does not respond when updates are available. The linked [support discussion](https://a8c.slack.com/archives/C0CMN0V97/p1760629206209709) confirms that the user was trying to reach Jetpack's plugin-management experience for an Atomic site.

The Sites table currently produces two destinations:

- Atomic sites open the site's external `wp-admin/plugins.php` page.
- Other sites with updates open `/plugins/updates/:site`, which Jetpack Cloud does not register.

Jetpack Cloud already has a working `/plugins/manage/:site` route. The site preview's “Manage plugins” action uses that route, and the plugin-management screen supports updating eligible plugins on Atomic and Jetpack-connected sites.

## Decision

All enabled Plugins status links in the Sites table will open `/plugins/manage/:site` inside Jetpack Cloud, regardless of update status or Atomic classification.

This removes the obsolete routing split and keeps the user in the product described by the support documentation. Existing permission and plugin-management rules remain responsible for deciding which actions are available after navigation.

## Scope

- Simplify the `plugin` case in `get-links.ts` to return the existing internal management route.
- Update the focused metadata and rendered-table regression tests.
- Add explicit Atomic coverage so the old external redirect cannot return unnoticed.
- Preserve the current Tracks event, tooltip, disabled-state behavior, and all non-plugin destinations.

No new route, UI, translated string, API request, or permission rule is required.

## Data flow

1. The Sites table formats a plugin status row.
2. `useRowMetadata` asks `getLinks` for the destination.
3. `getLinks` returns `/plugins/manage/:site` as an internal link.
4. Jetpack Cloud's existing plugin-management router selects the site and renders the plugin dashboard.
5. The dashboard exposes update actions when the existing capability checks allow them.

## Testing

Use test-driven development:

1. Change or add assertions for update-available and Atomic plugin rows to expect `/plugins/manage/:site` and `isExternalLink: false`.
2. Run the focused test first and confirm it fails against the current implementation.
3. Apply the minimal routing change.
4. Run the focused metadata and table tests, followed by lint/type checks scoped to the changed files where supported.
5. Start Jetpack Cloud locally with `yarn start` and verify that clicking a Plugins status opens the site's plugin-management screen without opening a new tab.

