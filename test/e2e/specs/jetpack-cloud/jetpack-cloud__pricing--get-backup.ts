/**
 * @group jetpack
 */

import {
	BrowserManager,
	CartCheckoutPage,
	DataHelper,
	LoginPage,
	TestAccount,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'Jetpack Cloud: Pricing - get backup as exising user' ),
	function () {
		let page: Page;
		let testAccount: TestAccount;

		beforeAll( async function () {
			// Launch a new browser window
			page = await browser.newPage();

			/* Login the test user */
			/* This can be extracted to a separate utility function/class */
			await page.goto( DataHelper.getCalypsoURL( '/pricing' ) );
			await page.locator( 'a:text-is("Log in")' ).click();
			// wait for navigation to complete
			await page.waitForNavigation();
			const loginPage = new LoginPage( page );
			testAccount = new TestAccount( 'calypsoPreReleaseUser' );
			await loginPage.logInWithCredentials(
				testAccount.credentials.username,
				testAccount.credentials.password
			);
		} );

		describe( 'Purchase single backup product', function () {
			let cartCheckoutPage: CartCheckoutPage;

			beforeAll( async function () {
				// Set the store cookie to simulate payment processing.
				await BrowserManager.setStoreCookie( page );
			} );

			it( 'Navigate to pricing page', async function () {
				await page.goto( DataHelper.getCalypsoURL( '/pricing' ) );
			} );

			it( 'Select "Get VaultPress Backup"', async function () {
				// Select the "Get" button for VaultPress Backup
				const startWithFreeBtn = page.locator( '[aria-label="Get VaultPress Backup"]' );
				// Click the button
				await startWithFreeBtn.click();
			} );

			it( 'Validate checkout items', async function () {
				cartCheckoutPage = new CartCheckoutPage( page );
				// Validate that the cart contains the correct product
				await cartCheckoutPage.validateCartItem( 'Jetpack VaultPress Backup (10GB)' );
			} );

			it( 'Enter payment details', async function () {
				await cartCheckoutPage.selectSavedCard( 'End to End Testing' );
			} );

			it( 'Compelete the purchase', async function () {
				await cartCheckoutPage.purchase( { timeout: 60 * 1000 } );

				// wait for navigation to complete
				await page.waitForNavigation();
			} );

			it( 'Validate that the purchase was successful', async function () {
				const url = new URL( page.url() );

				// Confirm that the page URL is correct
				expect( url.pathname.includes( '/thank-you' ) ).toBe( true );

				// Confirm that the page heading is correct
				const h1Content = await page.locator( 'h1' ).textContent();

				// Normalize whitespace to avoid &nbsp; being converted to "U+00a0"
				expect( h1Content?.replace( /\s+/g, ' ' ) ).toBe(
					`Ok, let's install Jetpack VaultPress Backup`
				);
			} );

			// TODO: May be add tests to validate the links and copy license key on the thank you page
		} );
	}
);
