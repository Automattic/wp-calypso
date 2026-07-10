# MANAGE-3 Plugin Update Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every enabled Plugins status on the Jetpack Cloud Sites screen open the existing site-specific plugin-management route.

**Architecture:** Keep link selection in the existing `getLinks` helper, but remove the obsolete Atomic/update-status split for plugin rows. Preserve the surrounding metadata and rendering components, and lock the behavior down at both the metadata-hook and rendered-table levels.

**Tech Stack:** TypeScript, React, Jest, Testing Library, Calypso router

---

### Task 1: Add regression coverage and implement the route correction

**Files:**

- Modify: `client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content/hooks/test/use-row-metadata.ts`
- Modify: `client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-table/test/site-table.tsx`
- Modify: `client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content/lib/get-links.ts`

- [x] **Step 1: Change the non-Atomic metadata expectation and add explicit Atomic coverage**

In `use-row-metadata.ts`, change the existing plugin expectation to:

```ts
const expected = {
	eventName: 'calypso_jetpack_agency_dashboard_update_plugins_click_small_screen',
	isExternalLink: false,
	link: `/plugins/manage/${ FAKE_SITE.url }`,
	isSupported: true,
	row: rows.plugin,
	siteDown: false,
	tooltip: 'Plugin updates are available',
	tooltipId: `${ FAKE_SITE.blog_id }-plugin`,
};
```

Then add this test immediately afterward:

```ts
it( 'should return the plugin management link for Atomic sites', () => {
	jest.spyOn( useIsMultisiteSupported, 'default' ).mockReturnValue( true );
	const {
		result: { current: metadata },
	} = renderHook( () =>
		useRowMetadata(
			{
				...rows,
				site: {
					...rows.site,
					value: { ...FAKE_SITE, is_atomic: true },
				},
			},
			'plugin',
			false
		)
	);

	expect( metadata.link ).toEqual( `/plugins/manage/${ FAKE_SITE.url }` );
	expect( metadata.isExternalLink ).toBe( false );
} );
```

In `site-table.tsx`, change the rendered plugin link assertion to:

```ts
expect( pluginEle.getAttribute( 'href' ) ).toEqual( `/plugins/manage/${ urlToSlug( siteUrl ) }` );
```

- [x] **Step 2: Run the focused tests and verify RED**

Run:

```bash
yarn test-client client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content/hooks/test/use-row-metadata.ts client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-table/test/site-table.tsx --runInBand
```

Expected: FAIL because the current helper returns `/plugins/updates/:site` for non-Atomic sites and an external `wp-admin/plugins.php` link for Atomic sites.

- [x] **Step 3: Apply the minimal production change**

Replace the `plugin` case in `get-links.ts` with:

```ts
case 'plugin': {
	link = `/plugins/manage/${ siteUrlWithMultiSiteSupport }`;
	break;
}
```

- [x] **Step 4: Run the focused tests and verify GREEN**

Run:

```bash
yarn test-client client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content/hooks/test/use-row-metadata.ts client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-table/test/site-table.tsx --runInBand
```

Expected: both suites pass, including the new Atomic regression case.

- [x] **Step 5: Check formatting and lint the changed source files**

Run:

```bash
yarn prettier --check client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content/lib/get-links.ts client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content/hooks/test/use-row-metadata.ts client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-table/test/site-table.tsx docs/superpowers/plans/2026-07-10-manage-3-plugin-update-link.md
yarn eslint client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content/lib/get-links.ts client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content/hooks/test/use-row-metadata.ts client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-table/test/site-table.tsx
```

Expected: both commands exit successfully.

- [x] **Step 6: Commit the implementation**

```bash
git add client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content/lib/get-links.ts client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content/hooks/test/use-row-metadata.ts client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-table/test/site-table.tsx docs/superpowers/plans/2026-07-10-manage-3-plugin-update-link.md
git commit -m "Jetpack Manage: Fix plugin status links"
```

### Task 2: Start Jetpack Cloud for local acceptance testing

**Files:**

- Verify: `.env` for the existing `PORT` value only; do not modify it

- [x] **Step 1: Start the Jetpack Cloud development environment**

Run:

```bash
yarn start-jetpack-cloud
```

Expected: the build completes and the development server listens on the port configured by the existing repository `.env`, falling back to `3000` when unset.

- [x] **Step 2: Verify the server responds**

Run `curl` against the reported local URL and confirm an HTTP response is returned.

- [x] **Step 3: Hand off the manual acceptance path**

Open the local Jetpack Cloud URL, sign in if necessary, select a site with plugin updates on the Sites screen, and click its Plugins status. Confirm the browser stays in the same tab and navigates to `/plugins/manage/:site?updates=1`, where only that site's available plugin updates are shown.

### Task 3: Scope the destination to the selected site's available updates

**Files:**

- Modify: `client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content/lib/get-links.ts`
- Modify: `client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content/hooks/test/use-row-metadata.ts`
- Modify: `client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-table/test/site-table.tsx`
- Modify: `client/jetpack-cloud/sections/plugin-management/index.ts`
- Modify: `client/my-sites/plugins/controller.jsx`
- Modify: `client/my-sites/plugins/plugins-dashboard/index.tsx`
- Modify: `client/my-sites/plugins/plugins-list/plugins-list-dataviews.tsx`
- Create: `client/my-sites/plugins/plugins-list/test/plugins-list-dataviews.tsx`
- Create: `client/my-sites/plugins/test/controller-dashboard.js`

- [x] **Step 1: Add failing link, controller, and DataView filter coverage**

Update the existing warning-link expectations to:

```ts
`/plugins/manage/${ siteSlug }?updates=1`;
```

Add a controller test that calls `renderPluginsDashboard` with `context.query.updates = '1'` and expects `context.primary.props.showOnlyUpdates` to be `true`.

Add a focused `PluginsListDataViews` test that renders an empty list with `showOnlyUpdates` enabled and expects the DataView's initial filters to contain:

```ts
[
	{
		field: 'status',
		operator: 'isAny',
		value: [ PLUGINS_STATUS.UPDATE ],
	},
];
```

- [x] **Step 2: Run the focused tests and verify RED**

```bash
yarn test-client client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content/hooks/test/use-row-metadata.ts client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-table/test/site-table.tsx client/my-sites/plugins/test/controller-dashboard.js client/my-sites/plugins/plugins-list/test/plugins-list-dataviews.tsx --runInBand
```

Expected: link assertions omit `updates=1`, the controller does not pass update intent, and the DataView starts without a status filter.

- [x] **Step 3: Propagate site and update context**

For update warnings, return `/plugins/manage/:site?updates=1`. Add `siteSelection` to the Jetpack Cloud `/plugins/manage/:site` route. Pass `siteSlug` and `showOnlyUpdates` from `renderPluginsDashboard`:

```tsx
context.primary = (
	<PluginsDashboard
		pluginSlug={ context.params.slug }
		siteSlug={ context.params.site }
		showOnlyUpdates={ context.query.updates === '1' }
	/>
);
```

- [x] **Step 4: Scope plugin aggregation to the selected site**

Read `getSelectedSite` in `PluginsDashboard`. When `siteSlug` is present, use only that selected site; while selection is loading, use an empty array. Preserve the existing all-sites behavior when `siteSlug` is absent.

- [x] **Step 5: Initialize and synchronize the update filter**

Add `showOnlyUpdates?: boolean` to `PluginsListDataViews`. Initialize `dataViewsState.filters` with the existing numeric update status filter and synchronize it when the route prop changes. Pass the prop through from `PluginsDashboard`.

- [x] **Step 6: Verify GREEN and lint**

```bash
yarn test-client client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content/hooks/test/use-row-metadata.ts client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-table/test/site-table.tsx client/my-sites/plugins/test/controller-dashboard.js client/my-sites/plugins/plugins-list/test/plugins-list-dataviews.tsx client/state/selectors/test/get-selected-or-all-sites-with-plugins.js --runInBand
yarn eslint client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content/lib/get-links.ts client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content/hooks/test/use-row-metadata.ts client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-table/test/site-table.tsx client/jetpack-cloud/sections/plugin-management/index.ts client/my-sites/plugins/controller.jsx client/my-sites/plugins/plugins-dashboard/index.tsx client/my-sites/plugins/plugins-list/plugins-list-dataviews.tsx client/my-sites/plugins/plugins-list/test/plugins-list-dataviews.tsx client/my-sites/plugins/test/controller-dashboard.js
```

Expected: all focused tests and lint pass.

- [x] **Step 7: Commit the follow-up**

```bash
git add client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content/lib/get-links.ts client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content/hooks/test/use-row-metadata.ts client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-table/test/site-table.tsx client/jetpack-cloud/sections/plugin-management/index.ts client/my-sites/plugins/controller.jsx client/my-sites/plugins/plugins-dashboard/index.tsx client/my-sites/plugins/plugins-list/plugins-list-dataviews.tsx client/my-sites/plugins/plugins-list/test/plugins-list-dataviews.tsx client/my-sites/plugins/test/controller-dashboard.js docs/superpowers/specs/2026-07-10-manage-3-plugin-update-link-design.md docs/superpowers/plans/2026-07-10-manage-3-plugin-update-link.md
git commit -m "Jetpack Manage: Filter plugin updates by site"
```

### Task 4: Clarify and visually align the plugin update status

**Files:**

- Modify: `client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-content/hooks/use-formatted-sites.ts`
- Modify: `client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content/site-status-column.tsx`
- Modify: `client/jetpack-cloud/sections/agency-dashboard/sites-overview/style.scss`
- Update: related Sites overview tests and fixtures

- [x] **Step 1: Add failing copy and warning-link class assertions**

Expect plugin update counts to render as “1 Update” and “N Updates.” In the rendered site-table test, assert that the plugin anchor has the `sites-overview__warning-link` class.

- [x] **Step 2: Verify RED**

```bash
yarn test-client client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-content/hooks/test/use-formatted-sites.ts client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-table/test/site-table.tsx --runInBand --silent
```

Expected: the formatter still returns “1 Available” and the warning link has no semantic class.

- [x] **Step 3: Implement localized copy and matching decoration color**

Use the existing singular/plural translation API to return “%(updates)d Update” or “%(updates)d Updates.” Add `sites-overview__warning-link` to warning anchors and set its color and `text-decoration-color` to `var(--color-warning-50)` for all interaction states.

- [x] **Step 4: Verify, lint, and commit**

```bash
yarn test-client client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-content/hooks/test/use-formatted-sites.ts client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-table/test/site-table.tsx client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-table-row/test/site-table-row.tsx client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-card/test/site-card.tsx --runInBand --silent
yarn lint:css
yarn eslint client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-content/hooks/use-formatted-sites.ts client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content/site-status-column.tsx
git add client/jetpack-cloud/sections/agency-dashboard/sites-overview docs/superpowers
git commit -m "Jetpack Manage: Clarify plugin update status"
```
