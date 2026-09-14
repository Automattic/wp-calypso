import {
	DataHelper,
	EmailClient,
	NewUserResponse,
	RestAPIClient,
	SecretsManager,
	UserSignupPage,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';

test.describe(
	DataHelper.createSuiteTitle( 'Signup: WordPress.com WPCC > WooCommerce via Email' ),
	{ tag: [ tags.CALYPSO_RELEASE ] },
	() => {
		const testUser = DataHelper.getNewTestUser( {
			useMailosaur: true,
			usernamePrefix: 'woo',
		} );
		const emailClient = new EmailClient();

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

		test( 'As a new user, I can sign up via WooCommerce WPCC with email', async ( { page } ) => {
			// The activation-email fetch alone blocks up to 120s (EmailClient),
			// before the 25s activation step and signup; the 120s default would be
			// spent on the email wait alone.
			test.setTimeout( 240 * 1000 );

			let activationLink: string;

			await test.step( 'Navigate to WooCommerce WPCC endpoint', async () => {
				const calypsoBaseURL = DataHelper.getCalypsoURL();
				const wooAuthPath = SecretsManager.secrets.wooSignupPath;
				await page.goto( calypsoBaseURL + wooAuthPath );
			} );

			await test.step( 'Create a new WordPress.com account', async () => {
				const userSignupPage = new UserSignupPage( page );
				newUserDetails = await userSignupPage.signupWoo( testUser.email );
			} );

			await test.step( 'Get activation link', async () => {
				const message = await emailClient.getLastMatchingMessage( {
					inboxId: testUser.inboxId,
					sentTo: testUser.email,
					subject: 'Activate',
				} );
				const links = await emailClient.getLinksFromMessage( message );
				activationLink = links.find( ( link: string ) => link.includes( 'activate' ) ) as string;
			} );

			await test.step( 'Activate account', async () => {
				const activationPage = await page.context().newPage();
				await activationPage.goto( activationLink!, { waitUntil: 'load', timeout: 25000 } );
			} );
		} );
	}
);
