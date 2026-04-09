import {
	DataHelper,
	LoginPage,
	NewUserResponse,
	RestAPIClient,
	UserSignupPage,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';

test.describe(
	DataHelper.createSuiteTitle( 'Login: Visit login page while logged in' ),
	{ tag: [ tags.CALYPSO_PR ] },
	() => {
		const testUser = DataHelper.getNewTestUser( {
			useMailosaur: true,
			usernamePrefix: 'signup',
		} );
		let newUserDetails: NewUserResponse | undefined;

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

		test( 'As a logged-in user, visiting login shows continue options', async ( { page } ) => {
			await test.step( 'When I navigate to the Login page', async () => {
				const loginPage = new LoginPage( page );
				await loginPage.visit();
			} );

			await test.step( 'When I click on button to create a new account', async () => {
				const loginPage = new LoginPage( page );
				await loginPage.clickCreateNewAccount();
			} );

			await test.step( 'When I sign up as a new user', async () => {
				const userSignupPage = new UserSignupPage( page );
				newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );
			} );

			await test.step( 'When I go to login page', async () => {
				const loginPage = new LoginPage( page );
				await loginPage.visit();
			} );

			await test.step( 'Then the "Continue" and "Login with another account" buttons are visible', async () => {
				const loginPage = new LoginPage( page );
				await loginPage.validateContinueAsYourself( testUser.username, testUser.email );
			} );
		} );
	}
);
