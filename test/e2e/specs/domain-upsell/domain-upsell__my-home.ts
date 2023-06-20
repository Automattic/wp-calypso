/**
 * @group calypso-pr
 */

import { TestAccount, BrowserManager, RestAPIClient } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( 'Domain: Upsell (Home)', function () {
	let suggestedDomain: string;
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

	it( 'Wait for Home dashboard to fully load', async function () {
		// There is nothing in the front-end to key off to confirm whether the
		// Home dashboard has fully loaded.
		// This is a serious compromise to get the ball moving on this refactor.
		// See: https://github.com/Automattic/wp-calypso/issues/78414
		try {
			// Suppress errors because the intention here is to add some wait
			// for the Home dashboard to finish loading.
			await page.waitForLoadState( 'networkidle' );
		} catch {
			// noop
		}
	} );

	it( 'Domain upsell card is present', async function () {
		await page
			.getByRole( 'main' )
			.getByRole( 'heading', { name: /domain/ } )
			.waitFor();
	} );

	it( 'Domain upsell card has suggested domain', async function () {
		const locator = page.locator( '.domain-upsell-illustration' );
		await locator.waitFor();
		suggestedDomain = await locator.innerText();

		expect( suggestedDomain ).not.toBe( '' );
	} );

	it( 'Click to begin searching for a domain', async function () {
		await page.getByRole( 'main' ).getByRole( 'button', { name: 'Get this domain' } ).click();

		// The test user does not have a plan so the Plans upsell page will load.
		await page.waitForURL( /plans\/yearly/ );
	} );

	it( 'Choose the Free plan', async function () {
		await page.getByRole( 'button', { name: /free plan/ } ).click();
	} );

	it( 'Dismiss paid plan upgrade CTA', async function () {
		await page.getByRole( 'button', { name: 'That works for me' } ).click();
	} );

	it( 'Secure checkout loads', async function () {
		// Intentionally not checking whether the selected domain loads here,
		// because this spec can run in parallel in many branches thus leading
		// to a race condition.
		await page.waitForURL( /checkout/ );
	} );
} );
