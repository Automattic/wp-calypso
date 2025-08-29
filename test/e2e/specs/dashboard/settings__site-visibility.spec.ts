import { test, expect } from '../../lib/pw-base';

test.describe( 'Dashboard: Site Visibility Settings', { tag: '@dashboard' }, () => {
	test( 'As a new simple site user, I can set my site to different visibility settings', async ( {
		helperData,
		page,
		pageDashboard,
		pageIncognito,
		siteNew,
	} ) => {
		const incognitoContentLocator = pageIncognito.locator( 'body' );

		await test.step( 'Given I am on the site visibility settings page', async function () {
			const settingsUrl = helperData.getCalypsoURL(
				`sites/${ siteNew.blog_details.site_slug }/settings/site-visibility`
			);
			await page.goto( settingsUrl );
		} );

		await test.step( 'When I set the site visibility to Private', async function () {
			await pageDashboard.setSiteVisibility( 'Private' );
		} );

		await test.step( 'Then I can not see the site as an external visitor', async function () {
			await pageIncognito.goto( siteNew.blog_details.url );
			await expect( incognitoContentLocator ).toContainText( 'Private Site' );
		} );

		await test.step( 'When I set the site visibility to Coming Soon', async function () {
			await pageDashboard.setSiteVisibility( 'Coming soon' );
		} );

		await test.step( 'Then I can see the coming soon message as an external visitor', async function () {
			await pageIncognito.goto( siteNew.blog_details.url );
			await expect( incognitoContentLocator ).toContainText( 'coming soon' );
		} );

		await test.step( 'When I set the site visibility to Public', async function () {
			await pageDashboard.setSiteVisibility( 'Public' );
		} );

		await test.step( 'Then I can see the coming soon message as an external visitor', async function () {
			await pageIncognito.goto( siteNew.blog_details.url );
			await expect( incognitoContentLocator ).not.toContainText( 'Private Site' );
			await expect( incognitoContentLocator ).not.toContainText( 'coming soon' );
		} );
	} );
} );
