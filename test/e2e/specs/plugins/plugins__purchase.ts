/**
 * @group calypso-pr
 */

import {
	DataHelper,
	CartCheckoutPage,
	TestAccount,
	RestAPIClient,
	BrowserManager,
	SecretsManager,
	NewSiteResponse,
	envVariables,
	PluginsPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiDeleteSite } from '../shared';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'Plugins: Purchase multiple plugins and upgrade to Business plan' ),
	function () {
		const blogName = DataHelper.getBlogName();
		const planName = 'Business';
		const pluginName =
			envVariables.VIEWPORT_NAME === 'desktop'
				? 'WooCommerce Bookings'
				: 'WooCommerce Subscriptions';
		const plugin2Name =
			envVariables.VIEWPORT_NAME === 'desktop'
				? 'WooCommerce Subscriptions'
				: 'WooCommerce Bookings';
		let pluginsPage: PluginsPage;
		let siteCreatedFlag: boolean;
		let newSiteDetails: NewSiteResponse;
		let restAPIClient: RestAPIClient;
		let page: Page;
		let siteURL: string;

		beforeAll( async function () {
			// Set up the test site programmatically against simpleSiteFreePlanUser.
			const credentials = SecretsManager.secrets.testAccounts.simpleSiteFreePlanUser;

			restAPIClient = new RestAPIClient( credentials );
			console.info( 'Creating a new test site.' );
			newSiteDetails = await restAPIClient.createSite( {
				name: blogName,
				title: blogName,
			} );
			console.info( `New site created: ${ newSiteDetails.blog_details.url }` );
			siteCreatedFlag = true;

			// Launch browser.
			page = await browser.newPage();

			// Authenticate as simpleSiteFreePlanUser.
			const testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
			await testAccount.authenticate( page );
			siteURL = newSiteDetails.blog_details.site_slug as string;
			pluginsPage = new PluginsPage( page );
			await pluginsPage.visit( siteURL );
		} );

		describe( 'Plugin: Purchase', function () {
			jest.setTimeout( 1800000 );
			let cartCheckoutPage: CartCheckoutPage;

			beforeAll( async function () {
				await BrowserManager.setStoreCookie( page );
			} );

			it( `Purchase ${ pluginName } and show Elegibility warning`, async function () {
				await pluginsPage.visitPage( pluginName.replace( ' ', '-' ).toLowerCase(), siteURL );
				await pluginsPage.clickPurchasePlugin();
			} );

			it( `Elegibility warning accept for ${ pluginName }`, async function () {
				await pluginsPage.clickContinueElebigilityWarning();
			} );

			it( `Validate checkout page with 2 items in cart`, async function () {
				cartCheckoutPage = new CartCheckoutPage( page );
				await cartCheckoutPage.validateCartItemsCount( 2 );
			} );
			it( `Close checkout and leave items in cart`, async function () {
				await cartCheckoutPage.closeCheckout( true );
			} );

			it( `Purchase ${ plugin2Name } and show Elegibility warning`, async function () {
				await pluginsPage.visitPage( plugin2Name.replace( ' ', '-' ).toLowerCase(), siteURL );
				await pluginsPage.clickPurchasePlugin();
			} );

			it( `Elegibility warning accept for ${ plugin2Name }`, async function () {
				await pluginsPage.clickContinueElebigilityWarning();
			} );

			it( `WordPress.com ${ planName } is added to cart`, async function () {
				await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
			} );

			it( `${ pluginName } is added to cart`, async function () {
				await cartCheckoutPage.validateCartItem( `${ pluginName }` );
			} );

			it( `${ plugin2Name } is added to cart`, async function () {
				await cartCheckoutPage.validateCartItem( `${ plugin2Name }` );
			} );

			// it( 'Make purchase', async function () {
			// 	await cartCheckoutPage.purchaseWithPlugin( { timeout: 300 * 1000 } );
			// } );

			// it( 'See confirmation page', async function () {
			// 	await pluginsPage.validateConfirmationPagePostInstall( pluginName );
			// } );

			// it( `Click manage plugin`, async function () {
			// 	await pluginsPage.clickManageInstalledPluginButton();
			// } );
		} );

		afterAll( async function () {
			if ( ! siteCreatedFlag ) {
				return;
			}

			await apiDeleteSite( restAPIClient, {
				url: newSiteDetails.blog_details.url,
				id: newSiteDetails.blog_details.blogid,
				name: newSiteDetails.blog_details.blogname,
			} );
		} );
	}
);
