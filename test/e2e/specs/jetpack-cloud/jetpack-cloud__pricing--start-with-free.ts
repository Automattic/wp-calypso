/**
 * @group jetpack
 */

import { DataHelper } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Jetpack Cloud: Pricing - start with free' ), function () {
	let page: Page;

	beforeAll( async () => {
		// Launch a new browser window
		page = await browser.newPage();
	} );

	describe( 'Visit as a logged out user', function () {
		it( 'Navigate to pricing page', async function () {
			await page.goto( DataHelper.getCalypsoURL( '/pricing' ) );
		} );

		it( 'Select "Start with Jetpack Free"', async function () {
			// Select the "Start with Jetpack Free" button
			const startWithFreeBtn = page.locator( ':text-is("Start with Jetpack Free")' );
			// Click the button
			await startWithFreeBtn.click();

			// wait for the page to load
			await page.waitForLoadState( 'networkidle' );
		} );

		it( 'Validate welcome page', async function () {
			// Confirm that the page URL is correct
			expect( page.url().endsWith( '/jetpack-free/welcome' ) ).toBe( true );

			const h1Content = await page.locator( 'h1' ).textContent();

			// Confirm that the page heading is correct
			expect( h1Content ).toBe( 'Welcome to Jetpack! 🎉' );
		} );

		// TODO: May be add tests to validate the links on the welcome page
	} );
} );
