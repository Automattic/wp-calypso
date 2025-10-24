/**
 * @group calypso-release
 */

import {
	DataHelper,
	DomainSearchComponent,
	SignupPickPlanPage,
	CartCheckoutPage,
	LoginPage,
	NewUserResponse,
	UserSignupPage,
	NewSiteResponse,
	RestAPIClient,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared/api-close-account';
import { apiDeleteSite } from '../shared/api-delete-site';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Launch site flow: Purchase plan' ), function () {
	const planName = 'Personal';
	const testUser = DataHelper.getNewTestUser();
	let page: Page;
	let newUserDetails: NewUserResponse;
	let newSiteDetails: NewSiteResponse;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	describe( 'Register as new user', function () {
		let loginPage: LoginPage;

		it( 'Navigate to the Login page', async function () {
			loginPage = new LoginPage( page );
			await loginPage.visit();
		} );

		it( 'Click on button to create a new account', async function () {
			await loginPage.clickCreateNewAccount();
		} );

		it( 'Sign up as a new user', async function () {
			const userSignupPage = new UserSignupPage( page );
			newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );
		} );

		it( 'Select a .wordpress.com domain name', async function () {
			const domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.search( DataHelper.getBlogName() );
			await domainSearchComponent.skipPurchase();
		} );

		it( 'Select WordPress.com Free plan', async function () {
			const signupPickPlanPage = new SignupPickPlanPage( page );
			newSiteDetails = await signupPickPlanPage.selectPlan( 'Free', new RegExp( '.*/home/.*' ) );
		} );
	} );

	describe( 'launch-site flow', function () {
		it( 'Enter the flow', async function () {
			const flowUrl = DataHelper.getCalypsoURL(
				`/start/launch-site?siteSlug=${ newSiteDetails.blog_details.site_slug }`
			);
			await page.goto( flowUrl );
		} );

		it( 'Search for a domain', async function () {
			const domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.search( DataHelper.getBlogName() );
		} );

		it( 'Skip domain selection', async function () {
			const domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.skipPurchase();
		} );

		it( `Select ${ planName } plan`, async function () {
			const signupPickPlanPage = new SignupPickPlanPage( page );
			await signupPickPlanPage.selectPlanWithoutSiteCreation( planName );
		} );

		it( 'See plan and domain at checkout', async function () {
			const cartCheckoutPage = new CartCheckoutPage( page );
			await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
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

		if ( newSiteDetails ) {
			await apiDeleteSite( restAPIClient, {
				url: newSiteDetails.blog_details.url,
				id: newSiteDetails.blog_details.blogid,
				name: newSiteDetails.blog_details.blogname,
			} );
		}

		await apiCloseAccount( restAPIClient, {
			userID: newUserDetails.body.user_id,
			username: newUserDetails.body.username,
			email: testUser.email,
		} );
	} );
} );
