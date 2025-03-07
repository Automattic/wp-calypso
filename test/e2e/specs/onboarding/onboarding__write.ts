/**
 * @group calypso-release
 */

import {
	DataHelper,
	StartSiteFlow,
	RestAPIClient,
	DomainSearchComponent,
	SignupPickPlanPage,
	NewUserResponse,
	LoginPage,
	UserSignupPage,
	EditorPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount, fixme_retry } from '../shared';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Onboarding: Write Focus' ), function () {
	const blogName = DataHelper.getBlogName();
	const testUser = DataHelper.getNewTestUser( {
		usernamePrefix: 'signupfree',
	} );

	let newUserDetails: NewUserResponse;
	let page: Page;
	let selectedFreeDomain: string;

	beforeAll( async function () {
		page = await browser.newPage();
	} );

	describe( 'Register as new user', function () {
		let loginPage: LoginPage;

		it( 'Navigate to the Login page', async function () {
			loginPage = new LoginPage( page );
			await loginPage.visit();
		} );

		it( 'Click on button to create a new account', async function () {
			await loginPage.clickCreateNewAccount();
		} );

		it( 'Sign up as a new user', async function () {
			const userSignupPage = new UserSignupPage( page );
			newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );
		} );

		it( 'Select a .wordpress.com domain name', async function () {
			const domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.search( blogName );
			selectedFreeDomain = await domainSearchComponent.selectDomain( '.wordpress.com' );
		} );

		it( `Select WordPress.com Free plan`, async function () {
			const signupPickPlanPage = new SignupPickPlanPage( page );
			await signupPickPlanPage.selectPlan( 'Free' );
		} );
	} );

	describe( 'Onboarding', function () {
		const themeName = 'Retrospect';
		let startSiteFlow: StartSiteFlow;

		beforeAll( async function () {
			startSiteFlow = new StartSiteFlow( page );
		} );

		it( 'Enter Onboarding flow for the selected domain', async function () {
			await page.waitForURL( /setup\/site-setup\/goals\?/, { timeout: 30 * 1000 } );

			// Additional assertions for the URL.
			expect( page.url() ).toContain( 'siteSlug' );
			expect( page.url() ).toContain( selectedFreeDomain );
		} );

		it( 'Select "Publish a blog" goal', async function () {
			await startSiteFlow.selectGoal( 'Publish a blog' );
			await startSiteFlow.clickButton( 'Next' );
		} );

		it( 'Select theme', async function () {
			await startSiteFlow.clickButton( 'Show all Blog themes' );
			await startSiteFlow.selectTheme( themeName );
			await startSiteFlow.clickButton( 'Continue' );
		} );
	} );

	describe( 'Write', function () {
		const postTitle = DataHelper.getRandomPhrase();

		let editorPage: EditorPage;

		it( 'Launchpad is shown', async function () {
			// dirty hack to wait for the launchpad to load.
			// Stepper has a quirk where it redirects twice. Playwright hooks to the first one and thinks it was aborted.
			await fixme_retry( () => page.waitForURL( /home/ ) );
		} );

		it( 'Write first post', async function () {
			await page.getByRole( 'link', { name: 'Write your first post' } ).click();
		} );

		it( 'Editor loads', async function () {
			editorPage = new EditorPage( page );
			await editorPage.waitUntilLoaded();
			await editorPage.closeWelcomeGuideIfNeeded();
		} );

		it( 'Enter blog title', async function () {
			await editorPage.enterTitle( postTitle );
		} );

		it( 'Publish post', async function () {
			await editorPage.publish();
		} );

		it( 'First post congratulatory message is shown', async function () {
			const editorParent = await editorPage.getEditorParent();
			await editorParent
				.getByRole( 'heading', { name: 'Your first post is published!' } )
				.waitFor();
		} );

		it( 'View Next Steps', async function () {
			const editorParent = await editorPage.getEditorParent();
			await editorParent.getByRole( 'button', { name: 'Next steps' } ).click();
		} );
	} );

	describe( 'Launchpad', function () {
		it( 'Focused Launchpad is shown', async function () {
			const title = await page.getByText( "Let's get started!" );
			await title.waitFor( { timeout: 30 * 1000 } );
		} );
	} );

	afterAll( async function () {
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
} );
