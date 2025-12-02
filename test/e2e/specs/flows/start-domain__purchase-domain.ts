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
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared/api-close-account';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Domain-only flow: Purchase domain' ), function () {
	const testUser = DataHelper.getNewTestUser();
	let page: Page;
	let selectedDomain: string;
	let newUserDetails: NewUserResponse;

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

	it( 'Select "Just buy a domain" option', async function () {
		const domainSearchComponent = new DomainSearchComponent( page );
		await domainSearchComponent.selectJustBuyADomain();
	} );

	it( 'Sign up as a new user', async function () {
		const userSignupPage = new UserSignupPage( page );
		newUserDetails = await userSignupPage.signupWithEmail( testUser.email );
	} );

	it( 'See domain at checkout', async function () {
		const cartCheckoutPage = new CartCheckoutPage( page );
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
} );
