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
	DataHelper.createSuiteTitle( 'Signup: WordPress.com WPCC' ),
	{ tag: [ tags.CALYPSO_RELEASE ] },
	() => {
		const testUser = DataHelper.getNewTestUser( {
			useMailosaur: true,
			usernamePrefix: 'wpcc',
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

		test( 'As a new user, I can sign up via WPCC and navigate to WordPress.com', async ( {
			page,
		} ) => {
			// The activation-email fetch alone blocks up to 120s (EmailClient), on
			// top of the CrowdSignal dashboard, activation and /sites navigation;
			// the 120s default would be spent on the email wait alone.
			test.setTimeout( 240 * 1000 );

			let activationLink: string;

			await test.step( 'Navigate to CrowdSignal WPCC endpoint', async () => {
				const calypsoBaseURL = DataHelper.getCalypsoURL();
				const wpccAuthPath = SecretsManager.secrets.wpccAuthPath;
				await page.goto( calypsoBaseURL + wpccAuthPath );
			} );

			await test.step( 'Create a new WordPress.com account', async () => {
				const userSignupPage = new UserSignupPage( page );
				newUserDetails = await userSignupPage.signupWPCC( testUser.email );
			} );

			await test.step( 'User lands in CrowdSignal dashboard', async () => {
				// This will be a production site instead of staging or wpcalypso.
				await page.waitForSelector( 'div.welcome-main' );
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
				await page.goto( activationLink! );
			} );

			await test.step( 'Navigate to WordPress.com', async () => {
				// Cursory check to ensure the newly registered account does not have a site.
				// Waiting for `load` is required so Calypso loading won't swallow up
				// the click on navbar in the Close Account steps.
				await Promise.all( [
					page.waitForURL( '**/sites', { waitUntil: 'load' } ),
					page.goto( DataHelper.getCalypsoURL() ),
				] );
			} );
		} );
	}
);
