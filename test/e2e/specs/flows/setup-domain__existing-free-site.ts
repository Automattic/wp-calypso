/**
 * @group calypso-release
 */

import {
	DataHelper,
	BrowserManager,
	DomainSearchComponent,
	SelectItemsComponent,
	CartCheckoutPage,
	SignupPickPlanPage,
	SiteSelectComponent,
	UserSignupPage,
	NewUserResponse,
	NewSiteResponse,
	RestAPIClient,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared/api-close-account';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'Domain flow: Purchase a domain for an existing free site' ),
	function () {
		const siteCreationPlan = 'Free';
		const domainAdditionPlan = 'Personal';
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

			it( `Select ${ siteCreationPlan } plan`, async function () {
				const signupPickPlanPage = new SignupPickPlanPage( page );
				newSiteDetails = await signupPickPlanPage.selectPlan(
					siteCreationPlan,
					new RegExp( '.*/home/.*' )
				);
			} );
		} );

		describe( 'Add domain to the site', function () {
			it( 'Enter domain flow', async function () {
				const flowUrl = DataHelper.getCalypsoURL( '/setup/domain' );
				await page.goto( flowUrl );
			} );

			it( 'Search for a domain', async function () {
				const domainSearchComponent = new DomainSearchComponent( page );
				await domainSearchComponent.search( DataHelper.getBlogName() );
			} );

			it( 'Add the first suggestion to the cart', async function () {
				const domainSearchComponent = new DomainSearchComponent( page );
				selectedDomain = await domainSearchComponent.selectFirstSuggestion();
			} );

			it( 'Continue to next step', async function () {
				const domainSearchComponent = new DomainSearchComponent( page );
				await domainSearchComponent.continue();
			} );

			it( 'Select existing site option', async function () {
				const domainSearchComponent = new SelectItemsComponent( page );
				await domainSearchComponent.clickButton( 'Existing WordPress.com site', 'Select a site' );
			} );

			it( 'Select the site', async function () {
				const siteSelectComponent = new SiteSelectComponent( page );
				await siteSelectComponent.selectSite(
					newSiteDetails.blog_details.site_slug as string,
					false
				);
			} );

			it( `Select ${ domainAdditionPlan } plan`, async function () {
				const plansPage = new SignupPickPlanPage( page );

				await plansPage.selectPlan( domainAdditionPlan );
			} );

			it( 'See plan and domain at checkout', async function () {
				const cartCheckoutPage = new CartCheckoutPage( page );

				await cartCheckoutPage.validateCartItem( `WordPress.com ${ domainAdditionPlan }` );
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
