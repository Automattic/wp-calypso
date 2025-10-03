/**
 * @group calypso-release
 */

import {
	DataHelper,
	BrowserManager,
	RewrittenDomainSearchComponent,
	SelectItemsComponent,
	CartCheckoutPage,
	UserSignupPage,
	NewUserResponse,
	RestAPIClient,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared/api-close-account';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Domain flow: Purchase only a domain' ), function () {
	let page: Page;
	let selectedDomain: string;
	const testUser = DataHelper.getNewTestUser();
	let newUserDetails: NewUserResponse;

	beforeAll( async () => {
		page = await browser.newPage();
		await BrowserManager.setStoreCookie( page, { currency: 'USD' } );
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
		await domainSearchComponent.search( DataHelper.getBlogName() );
	} );

	it( 'Add the first suggestion to the cart', async function () {
		const domainSearchComponent = new RewrittenDomainSearchComponent( page );
		selectedDomain = await domainSearchComponent.selectFirstSuggestion();
	} );

	it( 'Continue to next step', async function () {
		const domainSearchComponent = new RewrittenDomainSearchComponent( page );
		await domainSearchComponent.continue();
	} );

	it( 'Select domain only option', async function () {
		const domainSearchComponent = new SelectItemsComponent( page );
		await domainSearchComponent.clickButton( 'Just buy a domain', 'Continue' );
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
