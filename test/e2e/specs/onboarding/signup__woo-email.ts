/**
 * @group calypso-release
 */

import {
	DataHelper,
	UserSignupPage,
	EmailClient,
	SecretsManager,
	RestAPIClient,
	NewUserResponse,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared';

declare const browser: Browser;

describe(
	DataHelper.createSuiteTitle( 'Signup: WordPress.com WPCC > WooCommerce via Email' ),
	function () {
		const testUser = DataHelper.getNewTestUser( {
			usernamePrefix: 'woo',
		} );
		const emailClient = new EmailClient();

		let page: Page;
		let newUserDetails: NewUserResponse | undefined;

		beforeAll( async () => {
			page = await browser.newPage();
		} );

		describe( 'Signup via /start/wpcc', function () {
			let activationLink: string;

			it( 'Navigate to WooCommerce WPCC endpoint', async function () {
				const calypsoBaseURL = DataHelper.getCalypsoURL();
				const wooAuthPath = SecretsManager.secrets.wooSignupPath;
				await page.goto( calypsoBaseURL + wooAuthPath );
			} );

			it( 'Create a new WordPress.com account', async function () {
				const userSignupPage = new UserSignupPage( page );
				newUserDetails = await userSignupPage.signupWoo( testUser.email );
			} );

			it( 'Get activation link', async function () {
				const message = await emailClient.getLastMatchingMessage( {
					inboxId: testUser.inboxId,
					sentTo: testUser.email,
					subject: 'Activate',
				} );
				const links = await emailClient.getLinksFromMessage( message );
				activationLink = links.find( ( link: string ) => link.includes( 'activate' ) ) as string;
			} );

			it( 'Activate account', async function () {
				const activationPage = await browser.newPage();
				await activationPage.goto( activationLink, { waitUntil: 'networkidle', timeout: 25000 } );
			} );
		} );

		afterAll( async function () {
			if ( ! newUserDetails ) {
				// Test fails before signup is complete so we don't need to close account.
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
	}
);
