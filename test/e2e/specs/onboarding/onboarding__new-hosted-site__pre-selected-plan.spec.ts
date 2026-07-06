import {
	CartCheckoutPage,
	DataHelper,
	NewUserResponse,
	RestAPIClient,
	UserSignupPage,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';

test.describe(
	DataHelper.createSuiteTitle( 'New Hosted Site Flow: With pre-selected plan' ),
	{ tag: [ tags.CALYPSO_RELEASE ] },
	() => {
		const planSlug = 'business-bundle';
		const planName = 'Business';
		const testUser = DataHelper.getNewTestUser();
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

		test( 'As a new user, signing up with a pre-selected plan goes directly to checkout', async ( {
			page,
		} ) => {
			await test.step( 'When I enter the flow with pre-selected plan', async () => {
				const flowUrl = DataHelper.getCalypsoURL( '/setup/new-hosted-site', {
					plan: planSlug,
				} );
				await page.goto( flowUrl );
			} );

			await test.step( 'When I sign up as a new user', async () => {
				const userSignupPage = new UserSignupPage( page );
				const promises = await Promise.all( [
					userSignupPage.signupSocialFirstWithEmail( testUser.email ),
					page.waitForURL( /.*\/checkout\/.*/, { timeout: 30 * 1000 } ),
				] );
				newUserDetails = promises[ 0 ];
			} );

			await test.step( 'Then I see plan at checkout', async () => {
				const cartCheckoutPage = new CartCheckoutPage( page );
				await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
			} );
		} );
	}
);
