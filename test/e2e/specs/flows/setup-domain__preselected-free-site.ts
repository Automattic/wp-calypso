/**
 * @group calypso-release
 */

import {
	DataHelper,
	BrowserManager,
	DomainSearchComponent,
	CartCheckoutPage,
	RestAPIClient,
	NewSiteResponse,
	SignupPickPlanPage,
	UserSignupPage,
	NewUserResponse,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared/api-close-account';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'Domain flow: Purchase a domain for a pre-selected free site' ),
	function () {
		const planName = 'Personal';
		let page: Page;
		let selectedDomain: string;
		const testUser = DataHelper.getNewTestUser();
		let newUserDetails: NewUserResponse;
		let newSiteDetails: NewSiteResponse;

		beforeAll( async () => {
			page = await browser.newPage();
			await BrowserManager.setStoreCookie( page, { currency: 'USD' } );
		} );

		describe( 'Create a free site', function () {
			it( 'Enter the onboarding flow', async function () {
				const flowUrl = DataHelper.getCalypsoURL( '/setup' );

				await page.goto( flowUrl );
			} );

			it( 'Sign up as a new user', async function () {
				const userSignupPage = new UserSignupPage( page );
				newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );
			} );

			it( 'Skip the domains step', async () => {
				const domainSearchComponent = new DomainSearchComponent( page );
				await domainSearchComponent.search( DataHelper.getBlogName() );
				await domainSearchComponent.skipPurchase();
			} );

			it( `Select ${ planName } plan`, async function () {
				const signupPickPlanPage = new SignupPickPlanPage( page );
				newSiteDetails = await signupPickPlanPage.selectPlan( planName );
			} );
		} );

		describe( 'Add domain to the site', function () {
			it( 'Enter the flow', async function () {
				const flowUrl = DataHelper.getCalypsoURL(
					`/setup/domain?siteSlug=${ newSiteDetails.blog_details.site_slug as string }`
				);

				await page.goto( flowUrl );
			} );

			it( 'Add the first suggestion to the cart', async function () {
				const domainSearchComponent = new DomainSearchComponent( page );
				selectedDomain = await domainSearchComponent.selectFirstSuggestion();
			} );

			it( 'Continue to next step', async function () {
				const domainSearchComponent = new DomainSearchComponent( page );
				await domainSearchComponent.continue();
			} );

			it( `Select ${ planName } plan`, async function () {
				const plansPage = new SignupPickPlanPage( page );

				await plansPage.selectPlan( planName );
			} );

			it( 'See plan and domain at checkout', async function () {
				const cartCheckoutPage = new CartCheckoutPage( page );

				await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
				await cartCheckoutPage.validateCartItem( selectedDomain );
			} );
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
