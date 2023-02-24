/**
 * @group jetpack
 */

import {
	BrowserManager,
	// CartCheckoutPage,
	DataHelper,
	LoginPage,
	TestAccount,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Jetpack Connect, offer Complete' ), function () {
	let page: Page;
	let testAccount: TestAccount;
	//define calypso URL

	//for prod
	//const calypsoURL = DataHelper.getCalypsoURL();

	//for dev
	const calypsoUrl = 'http://calypso.localhost:3000/';
	beforeAll( async function () {
		// Launch a new browser window
		page = await browser.newPage();

		//temporary local url
		await page.goto( calypsoUrl );

		await page.locator( 'a:text-is("Log In to WordPress.com")' ).click();
		// wait for navigation to complete
		await page.waitForNavigation();
		const loginPage = new LoginPage( page );
		testAccount = new TestAccount( 'jetpackUser' );
		await loginPage.logInWithCredentials(
			testAccount.credentials.username,
			testAccount.credentials.password
		);
	} );

	describe( 'Navigate to complete offer page', function () {
		beforeAll( async function () {
			// Set the store cookie to simulate payment processing.
			await BrowserManager.setStoreCookie( page );
		} );

		//navigate to http://calypso.localhost:3000/jetpack/connect/plans/complete/ (append the test user's site URL)
		it( 'Navigate to get complete page', async function () {
			//get url for test account's site
			const siteUrl = () => {
				const formattedSiteUrl = DataHelper.getAccountSiteURL( 'jetpackUser' ).replace(
					/^https?:\/\//,
					''
				);
				return formattedSiteUrl;
			};

			//append site url to complete page url
			const completePageUrl = calypsoUrl + 'jetpack/connect/plans/complete/' + siteUrl();

			await page.goto( completePageUrl );
		} );
		// it( 'is pausing', async () => {
		// 	await new Promise( () =>
		// 		setTimeout( () => {
		// 			console.log( "Why don't I run?" );
		// 			expect( true ).toBe( true );
		// 		}, 15000 )
		// 	);
		// } );

		it( 'clicks complete', async function () {
			//click complete button
			const completeBtn = page.locator( 'a:text-is("Get Complete")' );
			await completeBtn.click();
		} );

		// this is purely for dev builds.  For staging/prod, use the cart checkout page and validateCartItem
		it( 'Validate checkout items', async function () {
			//wait for page load
			const cartItem = await page
				.locator( 'div.order-review-section > ul > li > div' )
				.textContent();
			expect( cartItem ).toContain( 'Jetpack Complete' );
		} );

		//todo: in production we'll need to test the actual purchase and thank you page redirect
	} );
} );
