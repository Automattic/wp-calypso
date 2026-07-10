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

Open the local Jetpack Cloud URL, sign in if necessary, select a site with plugin updates on the Sites screen, and click its Plugins status. Confirm the browser stays in the same tab and navigates to `/plugins/manage/:site`, where the site's eligible plugin update actions are available.
