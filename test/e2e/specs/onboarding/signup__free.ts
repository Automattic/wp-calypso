/**
 * @group calypso-release
 */

import {
	DataHelper,
	DomainSearchComponent,
	EditorPage,
	LoginPage,
	UserSignupPage,
	SignupPickPlanPage,
	CloseAccountFlow,
	StartSiteFlow,
	SidebarComponent,
	GeneralSettingsPage,
	ComingSoonPage,
	MyHomePage,
	SecretsManager,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { skipDescribeIf } from '../../jest-helpers';

declare const browser: Browser;

const isStagingOrProd = DataHelper.getCalypsoURL()
	.toLowerCase()
	.includes( 'https://wordpress.com' );

// Skipping while new onboarding flows are in transition and we map the new tests
skipDescribeIf( isStagingOrProd )(
	DataHelper.createSuiteTitle( 'Signup: WordPress.com Free' ),
	function () {
		const inboxId = SecretsManager.secrets.mailosaur.inviteInboxId;
		const username = `e2eflowtestingfree${ DataHelper.getTimestamp() }`;
		const email = DataHelper.getTestEmailAddress( {
			inboxId: inboxId,
			prefix: username,
		} );
		const signupPassword = SecretsManager.secrets.passwordForNewTestSignUps;
		const blogName = DataHelper.getBlogName();
		const tagline = `${ blogName } tagline`;

		let page: Page;
		let domainSearchComponent: DomainSearchComponent;
		let editorPage: EditorPage;
		let startSiteFlow: StartSiteFlow;
		let generalSettingsPage: GeneralSettingsPage;

		beforeAll( async () => {
			page = await browser.newPage();
		} );

		describe( 'Signup and select plan', function () {
			it( 'Navigate to Signup page', async function () {
				const loginPage = new LoginPage( page );
				await loginPage.visit();
				await loginPage.clickSignUp();
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
				await signupPickPlanPage.selectPlan( 'start with a free site' );
			} );
		} );

		describe( 'Onboarding flow', function () {
			it( 'Select "write" path', async function () {
				startSiteFlow = new StartSiteFlow( page );
				await startSiteFlow.clickButton( 'Start writing' );
			} );

			it( 'Enter blog name', async function () {
				await startSiteFlow.enterBlogName( blogName );
			} );

			it( 'Enter tagline', async function () {
				await startSiteFlow.enterTagline( tagline );
			} );

			it( 'Click continue', async function () {
				await startSiteFlow.clickButton( 'Continue' );
			} );

			it( 'Select "Choose a design" path', async function () {
				await startSiteFlow.clickButton( 'View designs' );
			} );

			it( 'See design picker screen', async function () {
				await startSiteFlow.validateOnDesignPickerScreen();
			} );

			it( 'Navigate back', async function () {
				await startSiteFlow.goBackOneScreen();
			} );

			it( 'Select "Draft your first post" path and land in editor', async function () {
				const navigationTimeout = 2 * 60 * 1000;
				// Let's add some resilience based on potential A/B test landing places for posts
				const navigationPromise = Promise.race( [
					page.waitForNavigation( { url: '**/post/**', timeout: navigationTimeout } ),
					page.waitForNavigation( {
						url: '**/wp-admin/post-new.php**',
						timeout: navigationTimeout,
					} ),
				] );

				await Promise.all( [ navigationPromise, startSiteFlow.clickButton( 'Start writing' ) ] );
			} );
		} );

		describe( 'Validate site metadata', function () {
			it( 'Return to Calypso dashboard', async function () {
				editorPage = new EditorPage( page );
				await editorPage.exitEditor();
			} );

			it( 'Navigate to settings', async function () {
				const sidebarComponent = new SidebarComponent( page );
				await sidebarComponent.navigate( 'Settings', 'General' );
			} );

			it( 'Validate blog name and tagline', async function () {
				generalSettingsPage = new GeneralSettingsPage( page );

				await generalSettingsPage.validateSiteTitle( blogName );
				await generalSettingsPage.validateSiteTagline( tagline );
			} );
		} );

		describe( 'Launch site', function () {
			it( 'Verify site is not yet launched', async function () {
				const tmpPage = await browser.newPage();
				// TODO: make a utility to obtain the blog URL.
				await tmpPage.goto( `https://${ blogName }.wordpress.com` );
				// View site without logging in.
				const comingSoonPage = new ComingSoonPage( tmpPage );
				await comingSoonPage.validateComingSoonState();
				// Dispose the test page and context.
				await tmpPage.close();
			} );

			it( 'Start site launch', async function () {
				const sidebarComponent = new SidebarComponent( page );
				await sidebarComponent.navigate( 'Settings', 'General' );
				const generalSettingsPage = new GeneralSettingsPage( page );
				await generalSettingsPage.launchSite();
			} );

			it( 'Search for a domain to reveal Skip Purchase button', async function () {
				domainSearchComponent = new DomainSearchComponent( page );
				await domainSearchComponent.search( username + '.live' );
			} );

			it( 'Skip domain purchasse', async function () {
				const domainSearchComponent = new DomainSearchComponent( page );
				await domainSearchComponent.clickButton( 'Skip Purchase' );
			} );

			it( 'Keep free plan', async function () {
				const signupPickPlanPage = new SignupPickPlanPage( page );
				await signupPickPlanPage.selectPlan( 'start with free' );
			} );

			it( 'Confirm site is launched', async function () {
				const myHomePage = new MyHomePage( page );
				await myHomePage.validateTaskHeadingMessage( 'You launched your site!' );
			} );
		} );

		describe( 'Delete user account', function () {
			it( 'Close account', async function () {
				const closeAccountFlow = new CloseAccountFlow( page );
				await closeAccountFlow.closeAccount();
			} );
		} );
	}
);
