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

			it( 'Navigate to CrowdSignal and click to try for free', async function () {
				//  No POM for this page.
				await page.goto( 'https://crowdsignal.com/' );
				await Promise.all( [ page.waitForNavigation(), page.click( 'a:text("Try it free")' ) ] );
			} );

			it( 'Create a new WordPress.com account', async function () {
				await page.click( 'button:text("Create a WordPress.com Account")' );
				const userSignupPage = new UserSignupPage( page );
				await userSignupPage.signupWPCC( email, signupPassword );
			} );

			it( 'User lands in CrowdSignal dashboard', async function () {
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

		describe( 'Use WordPress.com account created via WPCC', function () {
			let readerPage: ReaderPage;

			it( 'Navigate to WordPress.com', async function () {
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
