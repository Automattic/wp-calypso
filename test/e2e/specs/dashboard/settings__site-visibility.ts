/**
 * @group calypso-pr
 * @group dashboard
 * @group settings
 */

import {
	DashboardPage,
	RestAPIClient,
	DataHelper,
	NewSiteResponse,
	LoginPage,
	UserSignupPage,
	NewUserResponse,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared';

declare const browser: Browser;

/**
 * Tests that a user can edit privacy settings on a site via the dashboard.
 *
 * This test verifies that site visibility (privacy) options can be changed
 * between Public, Private and Coming Soon modes.
 */
describe( 'Dashboard: Site Visibility Settings', function () {
	let newUserDetails: NewUserResponse;
	let page: Page;
	let dashboardPage: DashboardPage;
	let restAPIClient: RestAPIClient;
	let site: NewSiteResponse;

	const testUser = DataHelper.getNewTestUser( {
		usernamePrefix: 'sitevisibility',
	} );

	const siteName = DataHelper.getBlogName();

	beforeAll( async function () {
		page = await browser.newPage();

		// Using a newly created user avoid having too many sites.
		const loginPage = new LoginPage( page );
		await loginPage.visit();
		await loginPage.clickCreateNewAccount();
		const userSignupPage = new UserSignupPage( page );
		newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );

		restAPIClient = new RestAPIClient(
			{ username: testUser.username, password: testUser.password },
			newUserDetails.body.bearer_token
		);

		// Using a separate site avoid conflicts with other tests.$
		site = await restAPIClient.createSite( {
			name: siteName,
			title: siteName,
		} );

		// Visit the site visibility settings page
		dashboardPage = new DashboardPage( page );
		await dashboardPage.visitPath(
			`sites/${ site.blog_details.site_slug }/settings/site-visibility`
		);
	} );

	afterAll( async function () {
		if ( ! newUserDetails ) {
			return;
		}

		await restAPIClient.deleteSite( {
			id: site.blog_details.blogid,
			domain: site.blog_details.url,
		} );

		await apiCloseAccount( restAPIClient, {
			userID: newUserDetails.body.user_id,
			username: newUserDetails.body.username,
			email: testUser.email,
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

		// Open the site in a new incognito browser context to verify it's coming soon
		const incognitoPage = await browser.newPage();
		await incognitoPage.goto( site.blog_details.url );
		const pageContent = await incognitoPage.content();
		expect( pageContent ).toContain( 'coming soon' );
		await incognitoPage.close();
	} );

	it( 'Can change site visibility to Public', async function () {
		await page.getByRole( 'radio', { name: 'Public' } ).click();
		await saveChanges( page );

		// Open the site in a new incognito browser context to verify it's public
		const incognitoPage = await browser.newPage();
		await incognitoPage.goto( site.blog_details.url );
		const pageContent = await incognitoPage.content();
		expect( pageContent ).not.toContain( 'Private Site' );
		expect( pageContent ).not.toContain( 'coming soon' );
		await incognitoPage.close();
	} );

	it( 'Can discourage search engines from indexing site', async function () {
		await page
			.getByRole( 'checkbox', { name: 'Discourage search engines from indexing this site' } )
			.click();
		await saveChanges( page );

		const robotsPage = await browser.newPage();
		await robotsPage.goto( site.blog_details.url + '/robots.txt' );
		const pageContent = await robotsPage.content();
		expect( pageContent ).toContain( 'User-agent: *\nDisallow: /' );
		await robotsPage.close();
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
