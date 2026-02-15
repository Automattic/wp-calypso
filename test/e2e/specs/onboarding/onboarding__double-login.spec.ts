import { NewTestUserDetails, NewUserResponse, RestAPIClient } from '@automattic/calypso-e2e';
import { test, tags } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';

test.describe( 'Login: Visit login page while logged in', { tag: [ tags.CALYPSO_PR ] }, () => {
	let testUser: NewTestUserDetails;
	let newUserDetails: NewUserResponse;

	test.beforeAll( async ( { helperData } ) => {
		testUser = helperData.getNewTestUser( {
			usernamePrefix: 'signupfree',
		} );
	} );

	test( 'User sees continue as yourself when visiting login page while logged in', async ( {
		pageLogin,
		pageUserSignUp,
	} ) => {
		await test.step( 'Given the user navigates to the Login page', async () => {
			await pageLogin.visit();
		} );

		await test.step( 'When the user clicks the button to create a new account', async () => {
			await pageLogin.clickCreateNewAccount();
		} );

		await test.step( 'And signs up as a new user with email', async () => {
			newUserDetails = await pageUserSignUp.signupSocialFirstWithEmail( testUser.email );
		} );

		await test.step( 'When the user goes back to the login page', async () => {
			await pageLogin.visit();
		} );

		await test.step( 'Then the "Continue" and "Login with another account" buttons are visible', async () => {
			await pageLogin.validateContinueAsYourself( testUser.username, testUser.email );
		} );
	} );

	test.afterAll( async () => {
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
