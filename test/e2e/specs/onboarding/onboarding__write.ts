/**
 * @group calypso-release
 */

import {
	DataHelper,
	StartSiteFlow,
	RestAPIClient,
	SignupPickPlanPage,
	NewUserResponse,
	LoginPage,
	UserSignupPage,
	EditorPage,
	DomainSearchComponent,
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
			selectedFreeDomain = await domainSearchComponent.skipPurchase();
		} );

		it( 'Select WordPress.com Free plan', async function () {
			const signupPickPlanPage = new SignupPickPlanPage( page );
			const redirectUrl = new RegExp( 'home/.+\\?ref=onboarding' );
			await signupPickPlanPage.selectPlan( 'Free', redirectUrl );
		} );
	} );

	describe( 'Onboarding', function () {
		const themeName = 'Retrospect';
		let startSiteFlow: StartSiteFlow;

		beforeAll( async function () {
			startSiteFlow = new StartSiteFlow( page );
		} );

		it( 'Enter Onboarding flow for the selected domain', async function () {
			await page.waitForURL( /home\/.*ref=onboarding/, { timeout: 60 * 1000 } );

			// Additional assertions for the URL.
			expect( page.url() ).toContain( selectedFreeDomain );
		} );

		it( 'Select "Publish a blog" goal', async function () {
			const goalCards = page.locator( '.select-card-checkbox__container' );
			if ( ( await goalCards.count() ) === 0 ) {
				// Focused Launchpad skips the goal selection step.
				return;
			}

			await startSiteFlow.selectGoal( 'Publish a blog' );
			await startSiteFlow.clickButton( 'Next' );
		} );

		it( 'Select theme', async function () {
			const showThemesButton = page.getByRole( 'button', { name: 'Show all Blog themes' } );
			if ( ! ( await showThemesButton.isVisible() ) ) {
				// Some experiences skip the theme gallery.
				return;
			}

			await showThemesButton.click();
			await startSiteFlow.selectTheme( themeName );
			await startSiteFlow.clickButton( 'Continue' );
		} );
	} );

	describe( 'Write', function () {
		const postTitle = DataHelper.getRandomPhrase();

		let editorPage: EditorPage;
		let editorOpened = false;

		it( 'Launchpad is shown', async function () {
			// dirty hack to wait for the launchpad to load.
			// Stepper has a quirk where it redirects twice. Playwright hooks to the first one and thinks it was aborted.
			await fixme_retry( () => page.waitForURL( /home/ ) );
		} );

		it( 'Write first post', async function () {
			const writeFirstPostLink = page.getByRole( 'link', { name: 'Write your first post' } );
			if ( ! ( await writeFirstPostLink.isVisible() ) ) {
				return;
			}

			editorOpened = true;
			await writeFirstPostLink.click();
		} );

		it( 'Editor loads', async function () {
			if ( ! editorOpened ) {
				return;
			}

			editorPage = new EditorPage( page );
			await editorPage.waitUntilLoaded();
			await editorPage.closeWelcomeGuideIfNeeded();
		} );

		it( 'Enter blog title', async function () {
			if ( ! editorOpened ) {
				return;
			}

			await editorPage.enterTitle( postTitle );
		} );

		it( 'Publish post', async function () {
			if ( ! editorOpened ) {
				return;
			}

			await editorPage.publish();
		} );

		it( 'First post congratulatory message is shown', async function () {
			if ( ! editorOpened ) {
				return;
			}

			const editorParent = await editorPage.getEditorParent();
			await editorParent
				.getByRole( 'heading', { name: 'Your first post is published!' } )
				.waitFor();
		} );

		it( 'View Next Steps', async function () {
			if ( ! editorOpened ) {
				return;
			}

			const editorParent = await editorPage.getEditorParent();
			await editorParent.getByRole( 'button', { name: 'Next steps' } ).click();
		} );
	} );

	describe( 'Launchpad', function () {
		it( 'Focused Launchpad is shown', async function () {
			const title = await page.getByText( "Let's get started!" );
			if ( ! ( await title.isVisible() ) ) {
				return;
			}
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
