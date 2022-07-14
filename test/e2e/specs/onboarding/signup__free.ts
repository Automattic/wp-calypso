/**
 *
 */

import {
	DataHelper,
	DomainSearchComponent,
	EditorPage,
	LoginPage,
	UserSignupPage,
	SignupPickPlanPage,
	StartSiteFlow,
	SidebarComponent,
	GeneralSettingsPage,
	ComingSoonPage,
	MyHomePage,
	RestAPIClient,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared';
import type { SiteDetails, NewUserResponse } from '@automattic/calypso-e2e';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Signup: WordPress.com Free' ), function () {
	const testUser = DataHelper.getNewTestUser( {
		usernamePrefix: 'free',
	} );
	const tagline = `${ testUser.siteName } tagline`;

	let page: Page;
	let userDetails: NewUserResponse;
	let siteDetails: SiteDetails;
	let userCreatedFlag = false;
	let domainSearchComponent: DomainSearchComponent;
	let generalSettingsPage: GeneralSettingsPage;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	describe( 'Signup', function () {
		it( 'Navigate to Signup page', async function () {
			const loginPage = new LoginPage( page );
			await loginPage.visit();
			await loginPage.clickSignUp();
		} );

		it( 'Sign up as new user', async function () {
			const userSignupPage = new UserSignupPage( page );
			userDetails = await userSignupPage.signup(
				testUser.email,
				testUser.username,
				testUser.password
			);

			userCreatedFlag = true;
		} );

		it( 'Select a free .wordpress.com domain', async function () {
			domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.search( testUser.siteName );
			await domainSearchComponent.selectDomain( '.wordpress.com' );
		} );

		it( 'Select WordPress.com Free plan', async function () {
			const signupPickPlanPage = new SignupPickPlanPage( page );
			siteDetails = await signupPickPlanPage.selectPlan( 'Free' );
		} );
	} );

	describe( 'Onboarding flow', function () {
		let startSiteFlow: StartSiteFlow;

		it( 'Skip goals step', async function () {
			startSiteFlow = new StartSiteFlow( page );

			await page.waitForLoadState( 'networkidle' );
			const currentStep = await startSiteFlow.getCurrentStep();

			if ( currentStep === 'goals' ) {
				await startSiteFlow.selectGoal( 'Write & Publish' );
				await startSiteFlow.clickButton( 'Continue' );
			}
		} );

		it( 'Select a vertical', async function () {
			const currentStep = await startSiteFlow.getCurrentStep();
			if ( currentStep === 'vertical' ) {
				await startSiteFlow.enterVertical( 'People & Society' );
				await startSiteFlow.clickButton( 'Continue' );
			}
		} );

		it( 'Select "write" path', async function () {
			const currentStep = await startSiteFlow.getCurrentStep();
			if ( currentStep === 'intent' ) {
				await startSiteFlow.clickButton( 'Start writing' );
			}
		} );

		it( 'Enter blog name', async function () {
			await startSiteFlow.enterBlogName( testUser.siteName );
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
		let editorPage: EditorPage;

		it( 'Return to Calypso dashboard', async function () {
			editorPage = new EditorPage( page );
			// Force the flow back into the configured environment for the test suite e.g. wpcalypso or calypso.localhost
			editorPage.visit();
			await editorPage.exitEditor();
		} );

		it( 'Navigate to settings', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Settings', 'General' );
		} );

		it( 'Validate blog name and tagline', async function () {
			generalSettingsPage = new GeneralSettingsPage( page );

			await generalSettingsPage.validateSiteTitle( testUser.siteName );
			await generalSettingsPage.validateSiteTagline( tagline );
		} );
	} );

	describe( 'Launch site', function () {
		it( 'Verify site is not yet launched', async function () {
			const tmpPage = await browser.newPage();
			// TODO: make a utility to obtain the blog URL.
			await tmpPage.goto( siteDetails.url );

			// View site as logged out user.
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
			await domainSearchComponent.search( testUser.username + '.live' );
		} );

		it( 'Skip domain purchasse', async function () {
			const domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.clickButton( 'Skip Purchase' );
		} );

		it( 'Keep WordPress.com Free', async function () {
			try {
				const signupPickPlanPage = new SignupPickPlanPage( page );
				await signupPickPlanPage.selectPlan( 'Free' );
			} catch {
				// noop - see p1654033059549799-slack-C031TFM2NKC
				// or https://github.com/Automattic/wp-calypso/issues/64248.
			}
		} );

		it( 'Navigated to Home dashboard', async function () {
			const myHomePage = new MyHomePage( page );
			await myHomePage.validateTaskHeadingMessage( 'You launched your site!' );
		} );
	} );

	afterAll( async function () {
		const restAPIClient = new RestAPIClient(
			{ username: testUser.username, password: testUser.password },
			userDetails.body.bearer_token
		);

		if ( userCreatedFlag ) {
			await apiCloseAccount( restAPIClient, {
				userID: userDetails.body.user_id,
				username: testUser.username,
				email: testUser.email,
			} );
		}
	} );
} );
