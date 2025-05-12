/**
 * @group calypso-release
 */

import {
	DataHelper,
	RestAPIClient,
	NewUserResponse,
	UserSignupPage,
	CartCheckoutPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'New Hosted Site Flow: With pre-selected plan' ),
	function () {
		const planSlug = 'business-bundle';
		const planName = 'Business';
		const testUser = DataHelper.getNewTestUser();

		let newUserDetails: NewUserResponse;
		let cartCheckoutPage: CartCheckoutPage;
		let page: Page;

		beforeAll( async function () {
			page = await browser.newPage();
		} );

		it( 'Enter the flow', async function () {
			const flowUrl = DataHelper.getCalypsoURL( '/setup/new-hosted-site', {
				plan: planSlug,
			} );

			await page.goto( flowUrl );
		} );

		it( 'Sign up as a new user', async function () {
			const userSignupPage = new UserSignupPage( page );

			const promises = await Promise.all( [
				userSignupPage.signupSocialFirstWithEmail( testUser.email ),
				page.waitForURL( /.*\/checkout\/.*/, { timeout: 30 * 1000 } ),
			] );

			newUserDetails = promises[ 0 ];
		} );

		it( 'See plan at checkout', async function () {
			cartCheckoutPage = new CartCheckoutPage( page );

			await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
		} );

		afterAll( async function () {
			if ( ! newUserDetails ) {
				return;
			}

			const restAPIClient = new RestAPIClient(
				{
					username: testUser.username,
					password: testUser.password,
				},
				newUserDetails.body.bearer_token
			);

			await apiCloseAccount( restAPIClient, {
				userID: newUserDetails.body.user_id,
				username: newUserDetails.body.username,
				email: testUser.email,
			} );
		} );
	}
);
