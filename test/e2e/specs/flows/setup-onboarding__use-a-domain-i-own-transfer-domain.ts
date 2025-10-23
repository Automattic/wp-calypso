/**
 * @group calypso-release
 */

import {
	DataHelper,
	DomainSearchComponent,
	SignupPickPlanPage,
	CartCheckoutPage,
	UserSignupPage,
	NewUserResponse,
	RestAPIClient,
	NewSiteResponse,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared/api-close-account';
import { apiDeleteSite } from '../shared/api-delete-site';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'Onboarding flow: Purchase domain transfer and plan' ),
	function () {
		const testUser = DataHelper.getNewTestUser();
		const domain = 'a8ctesting.com';
		const planName = 'Personal';
		let page: Page;
		let newUserDetails: NewUserResponse;
		let newSiteDetails: NewSiteResponse;

		beforeAll( async () => {
			page = await browser.newPage();
		} );

		it( 'Enter the flow', async function () {
			const flowUrl = DataHelper.getCalypsoURL( '/setup/onboarding' );
			await page.goto( flowUrl );
		} );

		it( 'Sign up as a new user', async function () {
			const userSignupPage = new UserSignupPage( page );
			newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );
		} );

		it( 'Search for a domain', async function () {
			const domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.search( DataHelper.getBlogName() );
		} );

		it( 'Click the "Use a domain I already own" button', async function () {
			const domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.clickUseADomainIAlreadyOwn();
		} );

		it( 'Fill the "Use a odmain I own" input', async function () {
			const domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.fillUseDomainIOwnInput( domain );
		} );

		it( 'Select the "Transfer your domain" option', async function () {
			const domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.selectTransferYourDomain();
		} );

		it( `Select ${ planName } plan`, async function () {
			const signupPickPlanPage = new SignupPickPlanPage( page );
			newSiteDetails = await signupPickPlanPage.selectPlan( planName );
		} );

		it( 'See plan and domain at checkout', async function () {
			const cartCheckoutPage = new CartCheckoutPage( page );
			await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
			await cartCheckoutPage.validateCartItem( domain );
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

			await apiDeleteSite( restAPIClient, {
				url: newSiteDetails.blog_details.url,
				id: newSiteDetails.blog_details.blogid,
				name: newSiteDetails.blog_details.blogname,
			} );

			await apiCloseAccount( restAPIClient, {
				userID: newUserDetails.body.user_id,
				username: newUserDetails.body.username,
				email: testUser.email,
			} );
		} );
	}
);
