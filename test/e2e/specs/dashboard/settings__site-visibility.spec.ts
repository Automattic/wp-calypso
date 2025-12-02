import { DataHelper } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';

test.describe( 'Dashboard: Site Visibility Settings', { tag: [ tags.CALYPSO_RELEASE ] }, () => {
	test.skip(
		DataHelper.isCalypsoProduction(),
		'Skipping for WordPress.com as Multi-site Dashboard is not enabled yet.'
	);

	test( 'As a new simple site user, I can set my site visibility to Private, so that only I can see my site', async ( {
		pageDashboard,
		pageDashboardVisibilitySettings,
		pageIncognito,
		sitePublic,
	} ) => {
		await test.step( "Given I am on my new public site's visibility settings page", async function () {
			await pageDashboard.visitPath(
				`sites/${ sitePublic.blog_details.site_slug }/settings/site-visibility`
			);
		} );

		await test.step( "When I set my site's visibility to Private", async function () {
			await pageDashboardVisibilitySettings.setSiteVisibility( 'Private' );
		} );

		await test.step( "And I save my site's visbility settings", async function () {
			expect( await pageDashboardVisibilitySettings.saveSiteVisibilityChanges() ).toBe(
				'Site visibility settings saved.'
			);
		} );

		await test.step( 'Then I can not see my site if I check as an external visitor', async function () {
			await pageIncognito.goto( sitePublic.blog_details.url );
			expect( await pageIncognito.getPageText() ).toContain( 'Private Site' );
		} );
	} );

	test( 'As a new simple site user, I can set my site visibility to Coming Soon, so that others see a nice coming soon message', async ( {
		pageDashboard,
		pageDashboardVisibilitySettings,
		pageIncognito,
		sitePublic,
	} ) => {
		await test.step( "Given I am on my new public site's visibility settings page", async function () {
			await pageDashboard.visitPath(
				`sites/${ sitePublic.blog_details.site_slug }/settings/site-visibility`
			);
		} );

		await test.step( "When I set my site's visibility to 'Coming soon'", async function () {
			await pageDashboardVisibilitySettings.setSiteVisibility( 'Coming soon' );
		} );

		await test.step( "And I save my site's visbility settings", async function () {
			expect( await pageDashboardVisibilitySettings.saveSiteVisibilityChanges() ).toBe(
				'Site visibility settings saved.'
			);
		} );

		await test.step( 'Then I can see the coming soon message if I visit as an external visitor', async function () {
			await pageIncognito.goto( sitePublic.blog_details.url );
			expect( await pageIncognito.getPageText() ).toContain( 'coming soon' );
		} );
	} );

	test( 'As a new simple site user, I can set my site visibility to Public and discourage search engines, so that my content is less likely to show on search engines like Google', async ( {
		pageDashboard,
		pageDashboardVisibilitySettings,
		pageIncognito,
		sitePublic,
	} ) => {
		await test.step( "Given I am on my new public site's visibility settings page", async function () {
			await pageDashboard.visitPath(
				`sites/${ sitePublic.blog_details.site_slug }/settings/site-visibility`
			);
		} );

		await test.step( 'When I discourage search engines from indexing my site', async function () {
			await pageDashboardVisibilitySettings.setDiscourageSearchEngines();
		} );

		await test.step( "And I save my site's visbility settings", async function () {
			expect( await pageDashboardVisibilitySettings.saveSiteVisibilityChanges() ).toBe(
				'Site visibility settings saved.'
			);
		} );

		await test.step( 'Then I can still my public site if I visit as an external visitor', async function () {
			await pageIncognito.goto( sitePublic.blog_details.url );
			// Soft assert to allow for the possibility that the site is still private
			// or coming soon, and to test the robots.txt test step even if these checks fail.
			expect.soft( await pageIncognito.getPageText() ).not.toContain( 'Private Site' );
			expect.soft( await pageIncognito.getPageText() ).not.toContain( 'coming soon' );
		} );

		await test.step( 'But search engine robots will see a disallow instruction', async function () {
			await pageIncognito.goto( `${ sitePublic.blog_details.url }robots.txt` );
			expect( await pageIncognito.getPageText() ).toContain( 'User-agent: *\nDisallow: /' );
		} );
	} );
} );
