/**
 * @group calypso-release
 */

import {
	CartCheckoutPage,
	TestAccount,
	RestAPIClient,
	BrowserManager,
	SecretsManager,
	PluginsPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( 'Plugins: Add multiple to cart', function () {
	const credentials = SecretsManager.secrets.testAccounts.simpleSiteFreePlanUser;
	const plugin1Name = 'Sensei Pro';
	const plugin2Name = 'AutomateWoo';

	let pluginsPage: PluginsPage;
	let cartCheckoutPage: CartCheckoutPage;
	let page: Page;
	let restAPIClient: RestAPIClient;
	let testAccount: TestAccount;

	beforeAll( async function () {
		page = await browser.newPage();

		testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
		await testAccount.authenticate( page );

		restAPIClient = new RestAPIClient( testAccount.credentials );
		await restAPIClient.clearShoppingCart(
			testAccount.credentials.testSites?.primary.id as number
		);

		await BrowserManager.setStoreCookie( page );
		pluginsPage = new PluginsPage( page );
	} );

	describe.each( [ plugin1Name, plugin2Name ] )( 'Add %s plugin to cart', function ( pluginName ) {
		it( `Go to plugins page for ${ pluginName }`, async function () {
			await pluginsPage.visitPage(
				pluginName.toLowerCase().replace( ' ', '-' ),
				testAccount.credentials.testSites?.primary.url
			);
		} );

		it( 'Click on install button', async function () {
			await pluginsPage.clickInstallPlugin();
		} );

		it.each( [ 'WordPress.com', pluginName ] )( '%s is added to cart', async function ( target ) {
			cartCheckoutPage = new CartCheckoutPage( page );
			await cartCheckoutPage.validateCartItem( target );
		} );
	} );

	afterAll( async function () {
		const restAPIClient = new RestAPIClient( credentials );
		await restAPIClient.clearShoppingCart( credentials.testSites?.primary?.id as number );
	} );
} );
