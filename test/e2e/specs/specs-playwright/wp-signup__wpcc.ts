/**
 * @group calypso-release
 */

import {
	DataHelper,
	LoginPage,
	setupHooks,
	UserSignupPage,
	CloseAccountFlow,
	ReaderPage,
	SupportComponent,
	GutenboardingFlow,
	EmailClient,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe(
	DataHelper.createSuiteTitle( 'Signup: WordPress.com WPCC/Reader/Support Popover' ),
	function () {
		const inboxId = DataHelper.config.get( 'signupInboxId' ) as string;
		const username = `e2eflowtestingwpcc${ DataHelper.getTimestamp() }`;
		const email = DataHelper.getTestEmailAddress( {
			inboxId: inboxId,
			prefix: username,
		} );
		const signupPassword = DataHelper.config.get( 'passwordForNewTestSignUps' ) as string;

		let page: Page;

		setupHooks( ( args ) => {
			page = args.page;
		} );

		describe( 'Signup via /start/wpcc', function () {
			let activationLink: string;

			it( 'Navigate to CrowdSignal WPCC endpoint', async function () {
				let calypsoBaseURL = DataHelper.getCalypsoURL();
				calypsoBaseURL =
					calypsoBaseURL +
					'/start/crowdsignal/oauth2-name?ref=oauth2&oauth2_redirect=https%3A%2F%2Fpublic-api.wordpress.com%2Foauth2%2Fauthorize%2F%3Fclient_id%3D978%26response_type%3Dcode%26blog_id%3D0%26state%3D34604bf9bcb69d07819b97c65b744925c061ed944e4d30623b9b8cebf1a4ce34%26redirect_uri%3Dhttps%253A%252F%252Fapp.crowdsignal.com%252Fconnect%253Fsource%253Dsignup%2526action%253Drequest_access_token%26wpcom_connect%3D1%26jetpack-code%26jetpack-user-id%3D0%26action%3Doauth2-login&oauth2_client_id=978';
				await page.goto( calypsoBaseURL );
			} );

			it( 'Create a new WordPress.com account', async function () {
				const userSignupPage = new UserSignupPage( page );
				await userSignupPage.signupWPCC( email, signupPassword );
			} );

			it( 'User lands in CrowdSignal dashboard', async function () {
				// This will be a production site instead of staging or wpcalypso.
				await page.waitForSelector( 'div.welcome-main' );
			} );

			it( 'Get activation link', async function () {
				const emailClient = new EmailClient();
				const message = await emailClient.getLastEmail( {
					inboxId: inboxId,
					emailAddress: email,
					subject: 'Activate',
				} );
				const links = await emailClient.getLinksFromMessage( message );
				activationLink = links.find( ( link: string ) => link.includes( 'activate' ) ) as string;
			} );

			it( 'Activate account', async function () {
				await page.goto( activationLink );
			} );
		} );

		describe( 'Follow site with Reader', function () {
			let readerPage: ReaderPage;

			it( 'Navigate to WordPress.com', async function () {
				// Return to the webapp under test (staging/wpcalypso).
				await page.goto( DataHelper.getCalypsoURL() );
			} );

			it( 'Land in Reader and search', async function () {
				readerPage = new ReaderPage( page );
				await readerPage.search( 'e2eflowtestingnotifications' );
			} );

			it( 'Read first post', async function () {
				await readerPage.visitPost( { index: 1 } );
			} );

			it( 'Follow site', async function () {
				await readerPage.followSite();
			} );

			it( 'Navigate back to search listing', async function () {
				await page.goBack();
			} );
		} );

		describe( 'Support: Show me where', function () {
			let supportComponent: SupportComponent;

			it( 'Open Support popover', async function () {
				supportComponent = new SupportComponent( page );
				await supportComponent.openPopover();
			} );

			it( 'Search for help: Create a site', async function () {
				await supportComponent.search( 'create a site' );
			} );

			it( 'Click on result under Show me where', async function () {
				await supportComponent.clickResult( 'where', 1 );
			} );

			it( 'Exit Gutenboarding flow', async function () {
				const gutenboardingFlow = new GutenboardingFlow( page );
				await gutenboardingFlow.clickWpLogo();
			} );
		} );

		describe( 'Delete user account and ensure no longer accessible', function () {
			let loginPage: LoginPage;

			it( 'Close account', async function () {
				const closeAccountFlow = new CloseAccountFlow( page );
				await closeAccountFlow.closeAccount();
			} );

			it( 'Navigate to WordPress.com Login page', async function () {
				loginPage = new LoginPage( page );
				await loginPage.visit();
			} );

			it( 'Ensure user is unable to log in', async function () {
				await loginPage.login( { username: email, password: signupPassword } );
				await page.waitForSelector( ':text("This account has been closed")' );
			} );
		} );
	}
);
