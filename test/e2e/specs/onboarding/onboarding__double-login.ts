/**
 * @group calypso-release
 * @group calypso-pr
 */

import {
	DataHelper,
	RestAPIClient,
	NewUserResponse,
	LoginPage,
	UserSignupPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Login: Visit login page while logged in' ), function () {
	const testUser = DataHelper.getNewTestUser( {
		usernamePrefix: 'signupfree',
	} );

	let newUserDetails: NewUserResponse;
	let page: Page;
	let loginPage: LoginPage;

	beforeAll( async function () {
		page = await browser.newPage();
	} );

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

	it( 'Go to login page', async function () {
		loginPage = new LoginPage( page );
		await loginPage.visit();
	} );

	it( 'Make sure the "Continue" and "Login with another account" buttons are visible', async function () {
		await loginPage.validateContinueAsYourself( testUser.username, testUser.email );
	} );

	afterAll( async function () {
		if ( ! newUserDetails ) {
			return;
		}

		const restAPIClient = new RestAPIClient(
			{ username: testUser.username, password: testUser.password },
			newUserDetails.body.bearer_token
		);

		await apiCloseAccount( restAPIClient, {
			userID: newUserDetails.body.user_id,
			username: newUserDetails.body.username,
			email: testUser.email,
		} );
	} );
} );
