/**
 * @group calypso-pr
 */

import {
	CartCheckoutPage,
	TestAccount,
	BrowserManager,
	RestAPIClient,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( 'Domain: Upsell (Home)', function () {
	let cartCheckoutPage: CartCheckoutPage;
	let domain: string;
	let page: Page;

	beforeAll( async function () {
		const testAccount = new TestAccount( 'simpleSiteFreePlanUser' );

		const restAPIClient = new RestAPIClient( testAccount.credentials );
		await restAPIClient.clearShoppingCart(
			testAccount.credentials.testSites?.primary?.id as number
		);

		page = await browser.newPage();
		await BrowserManager.setStoreCookie( page );

		await testAccount.authenticate( page );
	} );

	it( 'Domain upsell CTA is present', async function () {
		await page
			.getByRole( 'main' )
			.getByRole( 'heading', { name: /domain/ } )
			.waitFor();

		domain = await page.locator( '.domain-upsell-illustration' ).innerText();
	} );

	it( 'Click on domain upsell CTA button', async function () {
		await page.getByRole( 'main' ).getByRole( 'button', { name: 'Get this domain' } ).click();
	} );

	it( 'Choose the Free plan', async function () {
		await page.getByRole( 'button', { name: /free plan/ } ).click();
	} );

	it( 'Dismiss paid plan upgrade CTA', async function () {
		await page.getByRole( 'button', { name: 'That works for me' } ).click();
	} );

	it( 'Secure checkout loads with the selected domain', async function () {
		cartCheckoutPage = new CartCheckoutPage( page );
		await cartCheckoutPage.validateCartItem( domain );
	} );
} );
