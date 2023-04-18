/**
 * @group calypso-release
 */

import {
	CartCheckoutPage,
	TestAccount,
	RestAPIClient,
	BrowserManager,
	SecretsManager,
	envVariables,
	PluginsPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( 'Plugins: Add two plugins to the cart', function () {
	const planName = 'Business';
	const plugin1Name =
		envVariables.VIEWPORT_NAME === 'desktop' ? 'AutomateWoo' : 'WooCommerce Subscriptions';
	const plugin2Name =
		envVariables.VIEWPORT_NAME === 'desktop' ? 'Sensei Pro' : 'WooCommerce Bookings';
	let pluginsPage: PluginsPage;
	let page: Page;
	let siteURL: string;
	let siteId: number;
	let restApiClient: RestAPIClient;
	const credentials = SecretsManager.secrets.testAccounts.simpleSiteFreePlanUser;

	beforeAll( async function () {
		// Launch browser.
		page = await browser.newPage();

		// Authenticate as simpleSiteFreePlanUser.
		const testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
		await testAccount.authenticate( page );
		await BrowserManager.setStoreCookie( page );
		siteURL = credentials.testSites?.primary.url as string;
		siteId = credentials.testSites?.primary?.id as number;

		restApiClient = new RestAPIClient( credentials );
		await restApiClient.clearShoppingCart( siteId );
	} );

	describe( 'Plugin: Purchase', function () {
		let cartCheckoutPage: CartCheckoutPage;

		it( `Navigate to plugins page`, async function () {
			pluginsPage = new PluginsPage( page );
			await pluginsPage.visit( siteURL );
		} );

		it( `Purchase ${ plugin1Name } and show Elegibility warning`, async function () {
			await pluginsPage.visitPage( plugin1Name.replace( ' ', '-' ).toLowerCase(), siteURL );
			await pluginsPage.clickPurchasePlugin();
		} );

		it( `Validate Elegibility warning for ${ plugin1Name } and continue`, async function () {
			await pluginsPage.validateAndContinueElebigilityWarning();
		} );

		it( `WordPress.com ${ planName } is added to cart`, async function () {
			cartCheckoutPage = new CartCheckoutPage( page );
			await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
		} );

		it( `${ plugin1Name } is added to cart`, async function () {
			await cartCheckoutPage.validateCartItem( `${ plugin1Name }` );
		} );

		it( `Close checkout and leave items in cart`, async function () {
			await cartCheckoutPage.closeCheckout( true );
		} );

		it( `Purchase ${ plugin2Name } and show Elegibility warning`, async function () {
			await pluginsPage.visitPage( plugin2Name.replace( ' ', '-' ).toLowerCase(), siteURL );
			await pluginsPage.clickPurchasePlugin();
		} );

		it( `Validate Elegibility warning for ${ plugin2Name } and continue`, async function () {
			await pluginsPage.validateAndContinueElebigilityWarning();
		} );

		it( `WordPress.com ${ planName } is still in cart`, async function () {
			cartCheckoutPage = new CartCheckoutPage( page );
			await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
		} );

		it( `${ plugin1Name } is still in cart`, async function () {
			await cartCheckoutPage.validateCartItem( `${ plugin1Name }` );
		} );

		it( `${ plugin2Name } is added to cart`, async function () {
			await cartCheckoutPage.validateCartItem( `${ plugin2Name }` );
		} );
	} );

	afterAll( async function () {
		const restAPIClient = new RestAPIClient( credentials );
		await restAPIClient.clearShoppingCart( credentials.testSites?.primary?.id as number );
	} );
} );
