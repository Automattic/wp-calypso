/**
 * @group calypso-pr
 */

import {
	DataHelper,
	CheckoutThankYouPage,
	SidebarComponent,
	PlansPage,
	CartCheckoutPage,
	TestAccount,
	RestAPIClient,
	BrowserManager,
	SecretsManager,
	NewSiteResponse,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiDeleteSite } from '../shared';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle(
		'Plans: Upgrade exising WordPress.com Free site to WordPress.com Pro'
	),
	function () {
		const blogName = DataHelper.getBlogName();
		let siteCreatedFlag: boolean;
		let newSite: NewSiteResponse;
		let restAPIClient: RestAPIClient;
		let page: Page;

		beforeAll( async function () {
			// Set up the test site programmatically.
			const credentials = SecretsManager.secrets.testAccounts.simpleSiteFreePlanUser;
			restAPIClient = new RestAPIClient( credentials );

			newSite = await restAPIClient.createSite( {
				name: blogName,
				title: blogName,
			} );

			if ( ! newSite ) {
				throw new Error( `Failed to create new site via REST API.\nHTTP response: ${ newSite }` );
			}
			siteCreatedFlag = true;

			// Authenticate as user.
			page = await browser.newPage();

			const testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
			await testAccount.authenticate( page );
		} );

		describe( 'Upgrade to WordPress.com Pro', function () {
			let cartCheckoutPage: CartCheckoutPage;
			let plansPage: PlansPage;

			beforeAll( async function () {
				await BrowserManager.setStoreCookie( page );
			} );

			it( 'Navigate to Upgrades > Plans', async function () {
				await page.goto( DataHelper.getCalypsoURL( `/plans/${ newSite.blog_details.site_slug }` ) );
			} );

			it( 'View available plans', async function () {
				plansPage = new PlansPage( page, 'current' );
				await plansPage.showPlanComparison();
			} );

			it( 'Click button to upgrade to WordPress.com Pro', async function () {
				await plansPage.selectPlan( 'Pro' );
			} );

			it( 'WordPress.com Pro is added to cart', async function () {
				cartCheckoutPage = new CartCheckoutPage( page );
				await cartCheckoutPage.validateCartItem( `WordPress.com Pro` );
			} );

			it( 'Make purchase', async function () {
				await cartCheckoutPage.purchase();
			} );

			it( 'View new features', async function () {
				const checkoutThankYouPage = new CheckoutThankYouPage( page );
				await checkoutThankYouPage.clickButton( 'View my new features' );
			} );
		} );

		describe( 'Validate WordPress.com Pro functionality', function () {
			let sidebarComponent: SidebarComponent;

			it( 'Navigate to Upgrades > Plans', async function () {
				sidebarComponent = new SidebarComponent( page );
				await sidebarComponent.navigate( 'Upgrades', 'Plans' );
			} );

			it( 'Plans page states user is on WordPress.com Pro plan', async function () {
				const plansPage = new PlansPage( page, 'current' );
				await plansPage.validateActivePlan( 'Pro' );
			} );
		} );

		afterAll( async function () {
			if ( ! siteCreatedFlag ) {
				return;
			}

			await apiDeleteSite( restAPIClient, {
				url: newSite.blog_details.url,
				id: newSite.blog_details.blogid,
				name: newSite.blog_details.blogname,
			} );
		} );
	}
);
