/**
 * @group calypso-release
 */

import {
	DataHelper,
	RestAPIClient,
	DomainSearchComponent,
	NewUserResponse,
	UserSignupPage,
	CartCheckoutPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared';

declare const browser: Browser;

/**
 * We need this test to ensure that the post-domain selection navigation
 * sends the user to the plans page or checkout.
 */
describe(
	DataHelper.createSuiteTitle(
		'New Hosted Site Flow: With domain selection and pre-selected plan'
	),
	function () {
		const planSlug = 'business-bundle';
		const planName = 'Business';
		const blogName = DataHelper.getBlogName();
		const testUser = DataHelper.getNewTestUser();

		let newUserDetails: NewUserResponse;
		let cartCheckoutPage: CartCheckoutPage;
		let domainSearchComponent: DomainSearchComponent;
		let page: Page;
		let selectedDomain: string;

		beforeAll( async function () {
			page = await browser.newPage();
		} );

		it( 'Enter the flow', async function () {
			const flowUrl = DataHelper.getCalypsoURL( '/setup/new-hosted-site', {
				showDomainStep: 'true',
				plan: planSlug,
			} );

			await page.goto( flowUrl );
		} );

		it( 'Sign up as a new user', async function () {
			const userSignupPage = new UserSignupPage( page );
			newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );
		} );

		it( 'Select a domain name', async function () {
			domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.search( blogName + '.live' );

			const promises = await Promise.all( [
				domainSearchComponent.selectDomain( '.live', false ),
				page.waitForURL( /.*\/checkout\/.*/, { timeout: 30 * 1000 } ),
			] );

			selectedDomain = promises[ 0 ];
		} );

		it( 'See domain and plan at checkout', async function () {
			cartCheckoutPage = new CartCheckoutPage( page );

			await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
			await cartCheckoutPage.validateCartItem( selectedDomain );
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
