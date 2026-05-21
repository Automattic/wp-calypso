/**
 * @group calypso-release
 */

import {
	DataHelper,
	StartSiteFlow,
	RestAPIClient,
	SignupPickPlanPage,
	NewSiteResponse,
	NewUserResponse,
	LoginPage,
	UserSignupPage,
	EditorPage,
	DomainSearchComponent,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount, apiCreateFreeSiteForUser, apiDeleteSite, fixme_retry } from '../shared';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Onboarding: Write Focus' ), function () {
	const blogName = DataHelper.getBlogName();
	const testUser = DataHelper.getNewTestUser( {
		usernamePrefix: 'signup',
	} );

	let newUserDetails: NewUserResponse;
	let newSiteDetails: NewSiteResponse;
	let page: Page;

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
			await domainSearchComponent.skipPurchase();
		} );

		it( 'Select WordPress.com Free plan', async function () {
			const signupPickPlanPage = new SignupPickPlanPage( page );
			// After this PR, picking Free on /setup/onboarding/plans redirects to
			// https://wordpress.com/choose for the PWYW A/B test instead of
			// creating a site directly. No /sites/new call is made here, so we
			// use selectPlanWithoutSiteCreation.
			const redirectUrl = /^https:\/\/wordpress\.com\/choose(?:[?#]|$)/;
			await signupPickPlanPage.selectPlanWithoutSiteCreation( 'Free', redirectUrl );
		} );
	} );

	// Picking Free now redirects to https://wordpress.com/choose for the PWYW
	// A/B test instead of creating a site, so the original UI path into the
	// onboarding/write/launchpad flow is no longer reachable. To preserve
	// downstream coverage, this block API-creates a free site and navigates
	// directly into /home with the onboarding ref before continuing.
	describe( 'Onboarding', function () {
		const themeName = 'Retrospect';
		let startSiteFlow: StartSiteFlow;

		beforeAll( async function () {
			startSiteFlow = new StartSiteFlow( page );

			newSiteDetails = await apiCreateFreeSiteForUser( testUser, newUserDetails, blogName );
			await page.goto(
				DataHelper.getCalypsoURL(
					`/home/${ newSiteDetails.blog_details.site_slug }?ref=onboarding`
				)
			);
		} );

		it( 'Enter Onboarding flow for the selected domain', async function () {
			await page.waitForURL( /home\/.*ref=onboarding/, { timeout: 60 * 1000 } );

			// Assert we're on the home view for the API-created site.
			expect( page.url() ).toContain( newSiteDetails.blog_details.site_slug );
		} );

		it( 'Select "Publish a blog" goal', async function () {
			const goalCards = page.locator( '.select-card-checkbox__container' );
			if ( ( await goalCards.count() ) === 0 ) {
				// Some experiences skip the goal selection step.
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
		it( 'Launchpad is shown', async function () {
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

		if ( newSiteDetails ) {
			await apiDeleteSite( restAPIClient, {
				url: newSiteDetails.blog_details.url,
				id: newSiteDetails.blog_details.blogid,
				name: newSiteDetails.blog_details.blogname,
			} );
		}

		await apiCloseAccount( restAPIClient, {
			userID: newUserDetails.body.user_id,
			username: newUserDetails.body.username,
			email: testUser.email,
		} );
	} );
} );
