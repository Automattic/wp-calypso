import {
	DataHelper,
	DomainSearchComponent,
	LoginPage,
	NewUserResponse,
	RestAPIClient,
	SignupPickPlanPage,
	UserSignupPage,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';

test.describe(
	DataHelper.createSuiteTitle( 'Onboarding: Write Focus' ),
	{ tag: [ tags.CALYPSO_RELEASE ] },
	() => {
		const blogName = DataHelper.getBlogName();
		const testUser = DataHelper.getNewTestUser( {
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

		test( 'As a new user, I can complete the write onboarding flow', async ( { page } ) => {
			// Signup plus the 90s wait for site creation to redirect can exceed the 120s default.
			test.setTimeout( 180 * 1000 );

			let selectedFreeDomain: string;

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

			await test.step( 'When I select a .wordpress.com domain name', async () => {
				const domainSearchComponent = new DomainSearchComponent( page );
				await domainSearchComponent.search( blogName );
				selectedFreeDomain = await domainSearchComponent.skipPurchase();
			} );

			await test.step( 'When I select WordPress.com Free plan', async () => {
				const signupPickPlanPage = new SignupPickPlanPage( page );
				const redirectUrl = /wp-admin\/admin\.php\?page=site-setup-wp-admin/;
				await signupPickPlanPage.selectPlan( 'Free', redirectUrl );
			} );

			await test.step( 'Then I land on Site Setup for the selected domain', async () => {
				expect( page.url() ).toContain( selectedFreeDomain );
			} );
		} );
	}
);
