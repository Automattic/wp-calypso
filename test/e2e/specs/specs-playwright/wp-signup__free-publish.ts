import {
	DataHelper,
	DomainSearchComponent,
	GutenbergEditorPage,
	LoginPage,
	NewPostFlow,
	setupHooks,
	UserSignupPage,
	AccountSettingsPage,
	AccountClosedPage,
	BrowserManager,
	EmailClient,
	NavbarComponent,
} from '@automattic/calypso-e2e';
import { SignupPickPlanPage } from '@automattic/calypso-e2e/src/lib/pages/signup-pick-plan-page';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Signup: WordPress.com Free/Publish' ), function () {
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

	describe( 'Interact', function () {
		it( 'Start a new post', async function () {
			const newPostFlow = new NewPostFlow( page );
			await newPostFlow.newPostFromNavbar();
		} );

		it( 'Enter post title', async function () {
			gutenbergEditorPage = new GutenbergEditorPage( page );
			const title = DataHelper.getRandomPhrase();
			await gutenbergEditorPage.enterTitle( title );
		} );

		it( 'Publish post', async function () {
			await gutenbergEditorPage.publish( { visit: false } );
		} );

		it( 'Return to Home dashboard', async function () {
			await gutenbergEditorPage.toggleSidebar();
			await gutenbergEditorPage.returnToDashboard();
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
			await loginPage.requestMagicLink( username );
		} );

		it( 'Magic link is received', async function () {
			const emailClient = new EmailClient();
			const message = await emailClient.getLastEmail( { inboxId: inboxId, emailAddress: email } );
			const links = await emailClient.getLinksFromMessage( message );
			magicLink = links.find( ( link: string ) => link.includes( 'accept-invite' ) ) as string;
			expect( magicLink ).toBeDefined();
		} );

		it( 'Log in using magic link', async function () {
			const loginPage = new LoginPage( page );
			await loginPage.followMagicLink( magicLink );
		} );
	} );

	describe( 'Delete user account', function () {
		it( 'Delete user account', async function () {
			const navbarComponent = new NavbarComponent( page );
			await navbarComponent.clickAccountSettings();
			const accountSettingsPage = new AccountSettingsPage( page );
			await accountSettingsPage.closeAccount();
		} );

		it( 'Confirm account is closed', async function () {
			const accountClosedPage = new AccountClosedPage( page );
			await accountClosedPage.confirmAccountClosed();
		} );
	} );
} );
