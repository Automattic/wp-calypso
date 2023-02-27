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

//temporary testing block that can be used to stop execution between tests
// it( 'is pausing', async () => {
// 	await new Promise( () =>
// 		setTimeout( () => {
// 			console.log( "Why don't I run?" );
// 			expect( true ).toBe( true );
// 		}, 15000 )
// 	);
// } );

describe( DataHelper.createSuiteTitle( 'Jetpack Connect, offer Complete' ), function () {
	let cartCheckoutPage: CartCheckoutPage;
	let page: Page;
	let testAccount: TestAccount;
	//define calypso URL

	//temp feature flag
	const featureFlag = '?flags=jetpack/offer-complete-after-activation';

	beforeAll( async function () {
		// Launch a new browser window
		page = await browser.newPage();
		//temporary local url
	} );

	it( 'login to Jetpack Connect page', async function () {
		//it appears the test site set up by the helper is already connected to Jetpack, so for now
		// this test navigates to the get complete page.  We will need to figure out how to get to an
		// unconnected site.
		const siteUrl = () => {
			const formattedSiteUrl = DataHelper.getAccountSiteURL( 'jetpackUser' ).replace(
				/^https?:\/\//,
				''
			);
			return formattedSiteUrl;
		};
		//append site url to complete page url
		const completePageUrl =
			DataHelper.getCalypsoURL( '/jetpack/connect/plans/complete/' ) + siteUrl() + featureFlag;

		await page.goto( completePageUrl );

		// temporary testing function to pause execution at a given step
		// await new Promise( () =>
		// 	setTimeout( () => {
		// 		console.log( "Why don't I run?" );
		// 		expect( true ).toBe( true );
		// 	}, 15000 )
		// );

		const loginPage = new LoginPage( page );
		testAccount = new TestAccount( 'jetpackUser' );

		await loginPage.logInWithCredentials(
			testAccount.credentials.username,
			testAccount.credentials.password
		);
	} );

	//the first part of this test is duplicating what we have in the first part
	describe( 'Navigate to complete offer page', function () {
		beforeAll( async function () {
			// Set the store cookie to simulate payment processing.
			await BrowserManager.setStoreCookie( page );
		} );

		// This function probably will not be necessary as its own step, but leaving it for reference for now
		// it( 'Navigate to get complete page', async function () {
		// 	//get url for test account's site
		// 	const siteUrl = () => {
		// 		const formattedSiteUrl = DataHelper.getAccountSiteURL( 'jetpackUser' ).replace(
		// 			/^https?:\/\//,
		// 			''
		// 		);
		// 		return formattedSiteUrl;
		// 	};
		// 	//append site url to complete page url
		// 	const completePageUrl =
		// 		DataHelper.getCalypsoURL( '/jetpack/connect/plans/complete/' ) + siteUrl() + featureFlag;

		// 	await page.goto( completePageUrl );
		// } );

		it( 'clicks complete', async function () {
			//click complete button
			const completeBtn = page.locator( 'a:text-is("Get Complete")' );
			await completeBtn.click();
		} );

		//validate Complete was added to the cart
		it( 'Validate checkout items', async function () {
			//wait for page load
			cartCheckoutPage = new CartCheckoutPage( page );
			// Validate that the cart contains the correct product
			await cartCheckoutPage.validateCartItem( 'Jetpack Complete' );
		} );

		// purchase Complete
		it( 'Compelete the purchase', async function () {
			await cartCheckoutPage.purchase( { timeout: 60 * 1000 } );

			// wait for navigation to complete
			await page.waitForNavigation();
		} );

		// another step is needed to verify whatever page one should land on after purchase
	} );
} );
