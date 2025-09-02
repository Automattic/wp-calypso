import { test, expect } from '../../lib/pw-base';

test.describe( 'Dashboard: Site Visibility Settings', { tag: '@dashboard' }, () => {
	test( 'As a new simple site user, I can set my site visibility to Private, so that only I can see my site', async ( {
		helperData,
		page,
		pageDashboard,
		pageIncognito,
		sitePublic,
	} ) => {
		const incognitoContentLocator = pageIncognito.locator( 'html' );

		await test.step( 'Given I am on the site visibility settings page', async function () {
			await page.goto(
				helperData.getCalypsoURL(
					`sites/${ sitePublic.blog_details.site_slug }/settings/site-visibility`
				)
			);
		} );

		await test.step( 'When I set the site visibility to Private', async function () {
			await pageDashboard.setSiteVisibility( 'Private' );
		} );

		await test.step( 'Then I can not see the site as an external visitor', async function () {
			await pageIncognito.goto( sitePublic.blog_details.url );
			await expect( incognitoContentLocator ).toContainText( 'Private Site' );
		} );
	} );

	test( 'As a new simple site user, I can set my site visibility to Coming Soon, so that others see a nice coming soon message', async ( {
		helperData,
		page,
		pageDashboard,
		pageIncognito,
		sitePublic,
	} ) => {
		const incognitoContentLocator = pageIncognito.locator( 'html' );

		await test.step( 'Given I am on the site visibility settings page', async function () {
			await page.goto(
				helperData.getCalypsoURL(
					`sites/${ sitePublic.blog_details.site_slug }/settings/site-visibility`
				)
			);
		} );

		await test.step( 'When I set the site visibility to Coming Soon', async function () {
			await pageDashboard.setSiteVisibility( 'Coming soon' );
		} );

		await test.step( 'Then I can see the coming soon message as an external visitor', async function () {
			await pageIncognito.goto( sitePublic.blog_details.url );
			await expect( incognitoContentLocator ).toContainText( 'coming soon' );
		} );
	} );

	test( 'As a new simple site user, I can set my site visibility to Public and discourage search engines, so that my content is less likely to show on search engines like Google', async ( {
		helperData,
		page,
		pageDashboard,
		pageIncognito,
		sitePublic,
	} ) => {
		const incognitoContentLocator = pageIncognito.locator( 'html' );

		await test.step( 'Given I am on the site visibility settings page for my public site', async function () {
			await page.goto(
				helperData.getCalypsoURL(
					`sites/${ sitePublic.blog_details.site_slug }/settings/site-visibility`
				)
			);
		} );

		await test.step( 'When I discourage search engines from indexing this site', async function () {
			await pageDashboard.setDiscourageSearchEngines();
		} );

		await test.step( 'Then I can still see the live site as an external visitor', async function () {
			await pageIncognito.goto( sitePublic.blog_details.url );
			// Soft assert to allow for the possibility that the site is still private
			// or coming soon, and to test the robots.txt test step even if these checks fail.
			await expect.soft( incognitoContentLocator ).not.toContainText( 'Private Site' );
			await expect.soft( incognitoContentLocator ).not.toContainText( 'coming soon' );
		} );

		await test.step( 'But robots will see a disallow instruction', async function () {
			await pageIncognito.goto( `${ sitePublic.blog_details.url }robots.txt` );
			await expect( incognitoContentLocator ).toContainText( 'User-agent: *\nDisallow: /' );
		} );
	} );
} );
