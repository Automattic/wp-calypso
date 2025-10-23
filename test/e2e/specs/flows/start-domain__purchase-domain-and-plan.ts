/**
 * @group calypso-release
 */

import {
	BrowserManager,
	DataHelper,
	DomainSearchComponent,
	CartCheckoutPage,
	UserSignupPage,
	NewUserResponse,
	RestAPIClient,
	SignupPickPlanPage,
	NewSiteResponse,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared/api-close-account';
import { apiDeleteSite } from '../shared/api-delete-site';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Domain-only flow: Purchase domain and plan' ), function () {
	const testUser = DataHelper.getNewTestUser();
	const planName = 'Personal';
	let page: Page;
	let selectedDomain: string;
	let newUserDetails: NewUserResponse;
	let newSiteDetails: NewSiteResponse;

	beforeAll( async () => {
		page = await browser.newPage();
		await BrowserManager.setStoreCookie( page, { currency: 'USD' } );
	} );

	it( 'Enter the flow', async function () {
		const flowUrl = DataHelper.getCalypsoURL( '/start/domain' );
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

	it( 'Select "New site" option', async function () {
		const domainSearchComponent = new DomainSearchComponent( page );
		await domainSearchComponent.selectNewSite();
	} );

	it( `Select ${ planName } plan`, async function () {
		const signupPickPlanPage = new SignupPickPlanPage( page );
		await signupPickPlanPage.selectPlanWithoutSiteCreation(
			planName,
			new RegExp( '.*start/domain/user-social.*' )
		);
	} );

	it( 'Sign up as a new user and wait for site creation', async function () {
		const userSignupPage = new UserSignupPage( page );
		[ newUserDetails, newSiteDetails ] = await userSignupPage.signupWithEmailAndWaitForSiteCreation(
			testUser.email
		);
	} );

	it( 'See domain and plan at checkout', async function () {
		const cartCheckoutPage = new CartCheckoutPage( page );
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
} );
