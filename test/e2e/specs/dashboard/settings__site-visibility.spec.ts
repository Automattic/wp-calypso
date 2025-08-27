/**
 * E2E test suite for verifying the site visibility settings in the WordPress Calypso dashboard.
 *
 * This test covers the following scenarios for a new simple site user:
 * - Navigating to the site visibility settings page.
 * - Setting the site visibility to "Private" and verifying that external visitors see a "Private Site" message.
 * - Setting the site visibility to "Coming soon" and verifying that external visitors see a "coming soon" message.
 * - Setting the site visibility to "Public" and verifying that external visitors do not see "Private Site" or "coming soon" messages.
 *
 * @module Dashboard: Site Visibility Settings
 * @group e2e
 * @see ../../lib/pw_base for Playwright test base utilities.
 */
import { test, expect } from '../../lib/pw_base';

test.describe( 'Dashboard: Site Visibility Settings', () => {
	test( 'As a new simple site user, I can set my site to different visibility settings', async ( {
		pageDashboard,
		siteNew,
		pageIncognito,
	} ) => {
		await test.step( 'Given I am on the site visibility settings page', async function () {
			await pageDashboard.visitPath(
				`sites/${ siteNew.blog_details.site_slug }/settings/site-visibility`
			);
		} );

		await test.step( 'When I set the site visibility to Private', async function () {
			await pageDashboard.setSiteVisibility( 'Private' );
		} );

		await test.step( 'Then I can not see the site as an external visitor', async function () {
			await pageIncognito.goto( siteNew.blog_details.url );
			await expect( pageIncognito.locator( 'body' ) ).toContainText( 'Private Site' );
		} );

		await test.step( 'When I set the site visibility to Coming Soon', async function () {
			await pageDashboard.setSiteVisibility( 'Coming soon' );
		} );

		await test.step( 'Then I can see the coming soon message as an external visitor', async function () {
			await pageIncognito.goto( siteNew.blog_details.url );
			await expect( pageIncognito.locator( 'body' ) ).toContainText( 'coming soon' );
		} );

		await test.step( 'When I set the site visibility to Public', async function () {
			await pageDashboard.setSiteVisibility( 'Public' );
		} );

		await test.step( 'Then I can see the coming soon message as an external visitor', async function () {
			await pageIncognito.goto( siteNew.blog_details.url );
			await expect( pageIncognito.locator( 'body' ) ).not.toContainText( 'Private Site' );
			await expect( pageIncognito.locator( 'body' ) ).not.toContainText( 'coming soon' );
		} );
	} );
} );
