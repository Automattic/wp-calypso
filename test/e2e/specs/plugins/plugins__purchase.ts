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
	envVariables,
	PluginsPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Plugins: Add two plugins to the cart' ), function () {
	const planName = 'Business';
	const pluginName =
		envVariables.VIEWPORT_NAME === 'desktop' ? 'WooCommerce Bookings' : 'WooCommerce Subscriptions';
	const plugin2Name =
		envVariables.VIEWPORT_NAME === 'desktop' ? 'WooCommerce Subscriptions' : 'WooCommerce Bookings';
	let pluginsPage: PluginsPage;
	let page: Page;
	let siteURL: string;

	const credentials = SecretsManager.secrets.testAccounts.simpleSiteFreePlanUser;

	beforeAll( async function () {
		const restAPIClient = new RestAPIClient( credentials );
		await restAPIClient.clearShoppingCart( credentials.testSites?.primary?.id as number );

		// Launch browser.
		page = await browser.newPage();

		// Authenticate as simpleSiteFreePlanUser.
		const testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
		await testAccount.authenticate( page );
		siteURL = credentials.testSites?.primary.url as string;
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

		it( `WordPress.com ${ planName } is added to cart`, async function () {
			cartCheckoutPage = new CartCheckoutPage( page );
			await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
		} );

		it( `${ pluginName } is added to cart`, async function () {
			await cartCheckoutPage.validateCartItem( `${ pluginName }` );
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
	} );

	afterAll( async function () {
		const restAPIClient = new RestAPIClient( credentials );
		await restAPIClient.clearShoppingCart( credentials.testSites?.primary?.id as number );
	} );
} );
