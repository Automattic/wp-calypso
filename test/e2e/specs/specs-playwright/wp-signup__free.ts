/**
 * @group calypso-release
 */

import {
	DataHelper,
	DomainSearchComponent,
	GutenbergEditorPage,
	LoginPage,
	NewPostFlow,
	setupHooks,
	UserSignupPage,
	SignupPickPlanPage,
	AccountSettingsPage,
	AccountClosedPage,
	BrowserManager,
	EmailClient,
	NavbarComponent,
	MeSidebarComponent,
	BrowserHelper,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe(
	DataHelper.createSuiteTitle( 'Signup: WordPress.com Free/Publish/Magic Link' ),
	function () {
		const inboxId = DataHelper.config.get( 'inviteInboxId' ) as string;
		const username = `e2eflowtestingeditor${ DataHelper.getTimestamp() }`;
		const email = DataHelper.getTestEmailAddress( {
			inboxId: inboxId,
			prefix: username,
		} );
		const signupPassword = DataHelper.config.get( 'passwordForNewTestSignUps' ) as string;
		const blogName = DataHelper.getBlogName();

		let page: Page;
		let domainSearchComponent: DomainSearchComponent;
		let gutenbergEditorPage: GutenbergEditorPage;

		setupHooks( ( args ) => {
			page = args.page;
		} );

		describe( 'Signup', function () {
			it( 'Navigate to Signup page', async function () {
				const loginPage = new LoginPage( page );
				await loginPage.clickSignup();
			} );

			it( 'Sign up as new user', async function () {
				const userSignupPage = new UserSignupPage( page );
				await userSignupPage.signup( email, username, signupPassword );
			} );

			it( 'Select a free .wordpress.com domain', async function () {
				domainSearchComponent = new DomainSearchComponent( page );
				await domainSearchComponent.search( blogName );
				await domainSearchComponent.selectDomain( '.wordpress.com' );
			} );

			it( 'Select WordPress.com Free plan', async function () {
				const signupPickPlanPage = new SignupPickPlanPage( page );
				await signupPickPlanPage.selectPlan( 'Free' );
			} );
		} );

		describe( 'Interact with editor', function () {
			it( 'Start a new post', async function () {
				const newPostFlow = new NewPostFlow( page );
				await newPostFlow.newPostFromNavbar();
			} );

			it( 'Return to Home dashboard', async function () {
				// Temporary workaround due to https://github.com/Automattic/wp-calypso/issues/51162.
				// Conditional can be removed once fixed.
				if ( BrowserHelper.getTargetDeviceName() === 'mobile' ) {
					await page.goBack();
				} else {
					gutenbergEditorPage = new GutenbergEditorPage( page );
					await gutenbergEditorPage.openNavSidebar();
					await gutenbergEditorPage.returnToDashboard();
				}
			} );
		} );

		describe( 'Magic link', function () {
			let magicLink: string;

			it( 'Clear authenticated state', async function () {
				await BrowserManager.clearAuthenticationState( page );
			} );

			it( 'Request magic link', async function () {
				const loginPage = new LoginPage( page );
				await loginPage.visit();
				await loginPage.requestMagicLink( email );
			} );

			it( 'Magic link is received', async function () {
				const emailClient = new EmailClient();
				const message = await emailClient.getLastEmail( {
					inboxId: inboxId,
					emailAddress: email,
					subject: 'Log in to WordPress.com',
				} );
				const links = await emailClient.getLinksFromMessage( message );
				magicLink = links.find( ( link: string ) =>
					link.includes( 'wpcom_email_click' )
				) as string;
				expect( magicLink ).toBeDefined();
			} );

			it( 'Log in using magic link', async function () {
				const loginPage = new LoginPage( page );
				await loginPage.followMagicLink( magicLink );
			} );
		} );

		describe( 'Delete user account', function () {
			// Magic link login will always land on the https://wordpress.com host, so we need to reset host for rest of test.
			it( 'Re-login to ensure correct host', async function () {
				await BrowserManager.clearAuthenticationState( page );
				const loginPage = new LoginPage( page );
				await loginPage.visit();
				await loginPage.login( { username: username, password: signupPassword } );
			} );

			it( 'Navigate to Me > Account Settings', async function () {
				const navbarComponent = new NavbarComponent( page );
				await navbarComponent.clickMe();
				const meSidebarComponent = new MeSidebarComponent( page );
				await meSidebarComponent.navigate( 'Account Settings' );
			} );

			it( 'Delete user account', async function () {
				const accountSettingsPage = new AccountSettingsPage( page );
				await accountSettingsPage.closeAccount();
			} );

			it( 'Confirm account is closed', async function () {
				const accountClosedPage = new AccountClosedPage( page );
				await accountClosedPage.confirmAccountClosed();
			} );
		} );
	}
);
