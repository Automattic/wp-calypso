/**
 * @group calypso-pr
 * @group dashboard
 * @group settings
 */

import {
	TestAccount,
	getTestAccountByFeature,
	envToFeatureKey,
	envVariables,
	DashboardPage,
	RestAPIClient,
	DataHelper,
	NewSiteResponse,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

/**
 * Tests that a user can edit privacy settings on a site via the dashboard.
 *
 * This test verifies that site visibility (privacy) options can be changed
 * between Public, Private and Coming Soon modes.
 */
describe( 'Dashboard: Site Visibility Settings', function () {
	let page: Page;
	let dashboardPage: DashboardPage;
	const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );
	const testAccount = new TestAccount( accountName );
	const siteName = DataHelper.getBlogName();
	const restAPIClient = new RestAPIClient( testAccount.credentials );
	let site: NewSiteResponse;

	beforeAll( async function () {
		// Using a separate site avoid conflicts with other tests.$
		site = await restAPIClient.createSite( {
			name: siteName,
			title: siteName,
		} );
		page = await browser.newPage();
		await testAccount.authenticate( page );
		dashboardPage = new DashboardPage( page );

		// Visit the site visibility settings page
		await dashboardPage.visitPath(
			`sites/${ site.blog_details.site_slug }/settings/site-visibility`
		);
	} );

	afterAll( async function () {
		await restAPIClient.deleteSite( {
			id: site.blog_details.blogid,
			domain: site.blog_details.url,
		} );
	} );

	it( 'Can change site visibility to Private', async function () {
		await page.getByRole( 'radio', { name: 'Private' } ).click();
		await saveChanges( page );

		// Open the site in a new incognito browser context to verify it's private
		const incognitoPage = await browser.newPage();
		await incognitoPage.goto( site.blog_details.url );
		const pageContent = await incognitoPage.content();
		expect( pageContent ).toContain( 'Private Site' );
		await incognitoPage.close();
	} );

	it( 'Can change site visibility to Coming soon', async function () {
		await page.getByRole( 'radio', { name: 'Coming soon' } ).click();
		await saveChanges( page );

		// Open the site in a new incognito browser context to verify it's private
		const incognitoPage = await browser.newPage();
		await incognitoPage.goto( site.blog_details.url );
		const pageContent = await incognitoPage.content();
		expect( pageContent ).toContain( 'coming soon' );
		await incognitoPage.close();
	} );

	it( 'Can change site visibility to Public', async function () {
		await page.getByRole( 'radio', { name: 'Public' } ).click();
		await saveChanges( page );

		// Open the site in a new incognito browser context to verify it's private
		const incognitoPage = await browser.newPage();
		await incognitoPage.goto( site.blog_details.url );
		const pageContent = await incognitoPage.content();
		expect( pageContent ).not.toContain( 'Private Site' );
		expect( pageContent ).not.toContain( 'coming soon' );
		await incognitoPage.close();
	} );
} );

/**
 * Save the changes and wait for the request to finish.
 *
 * @param page The Playwright page object
 */
async function saveChanges( page: Page ): Promise< void > {
	await page.waitForSelector( 'button[type="submit"]:not([disabled])' );
	await page.getByRole( 'button', { name: 'Save' } ).click();
	await page.waitForSelector( 'button:not(.is-busy)[type="submit"][disabled]' );
}
