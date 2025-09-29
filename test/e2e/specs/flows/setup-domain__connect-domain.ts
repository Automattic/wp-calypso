/**
 * @group calypso-release
 */

import {
	DataHelper,
	RewrittenDomainSearchComponent,
	SelectItemsComponent,
	CartCheckoutPage,
	RestAPIClient,
	SignupPickPlanPage,
	UseADomainIOwnPage,
	UserSignupPage,
	NewUserResponse,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared/api-close-account';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Domain flow: Connect a domain to a site' ), function () {
	const targetDomain = 'testwoo.com';

	const planName = 'Personal';
	let page: Page;
	const testUser = DataHelper.getNewTestUser();
	let newUserDetails: NewUserResponse;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	it( 'Enter the flow', async function () {
		const flowUrl = DataHelper.getCalypsoURL( '/setup/domain' );

		await page.goto( flowUrl );
	} );

	it( 'Sign up as a new user', async function () {
		const userSignupPage = new UserSignupPage( page );
		newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );
	} );

	it( 'Search for a domain', async function () {
		const domainSearchComponent = new RewrittenDomainSearchComponent( page );
		await domainSearchComponent.search( targetDomain );
	} );

	it( 'Click the bring it over button', async function () {
		const domainSearchComponent = new RewrittenDomainSearchComponent( page );
		await domainSearchComponent.clickBringItOver();
	} );

	it( 'Click the connect button', async function () {
		const useADomainIOwnPage = new UseADomainIOwnPage( page );
		await useADomainIOwnPage.clickContinue();
		await useADomainIOwnPage.clickButtonToConnectDomain();
	} );

	it( 'Select new site option', async function () {
		const domainSearchComponent = new SelectItemsComponent( page );
		await domainSearchComponent.clickButton( 'New site', 'Create a new site' );
	} );

	it( `Select ${ planName } plan`, async function () {
		const plansPage = new SignupPickPlanPage( page );

		await plansPage.selectPlan( planName );
	} );

	it( 'See plan and domain connection product at checkout', async function () {
		const cartCheckoutPage = new CartCheckoutPage( page );

		await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
		await cartCheckoutPage.validateCartItem( targetDomain, 'Domain Connection' );
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
} );
