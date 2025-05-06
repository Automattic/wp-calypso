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
	PlansPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'New Hosted Site Flow: With domain selection' ),
	function () {
		const planName = 'Business';
		const blogName = DataHelper.getBlogName();
		const testUser = DataHelper.getNewTestUser();

		let newUserDetails: NewUserResponse;
		let plansPage: PlansPage;
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
			selectedDomain = await domainSearchComponent.selectDomain( '.live', false );
		} );

		it( `Pick the ${ planName } plan`, async function () {
			plansPage = new PlansPage( page );

			await plansPage.selectPlan( planName );
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
