/**
 * @group calypso-release
 */

import {
	DataHelper,
	StartSiteFlow,
	RestAPIClient,
	DomainSearchComponent,
	SignupPickPlanPage,
	NewSiteResponse,
	NewUserResponse,
	LoginPage,
	UserSignupPage,
	EditorPage,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiCloseAccount } from '../shared';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Onboarding: Write Focus' ), function () {
	const blogName = DataHelper.getBlogName();
	const blogTagLine = `${ blogName } tagline`;
	const testUser = DataHelper.getNewTestUser( {
		usernamePrefix: 'signupfree',
	} );

	let newUserDetails: NewUserResponse;
	let newSiteDetails: NewSiteResponse;
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
			newUserDetails = await userSignupPage.signup(
				testUser.email,
				testUser.username,
				testUser.password
			);
		} );

		it( 'Select a .wordpress.com domain name', async function () {
			const domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.search( blogName );
			selectedFreeDomain = await domainSearchComponent.selectDomain( '.wordpress.com' );
		} );

		it( `Select WordPress.com Free plan`, async function () {
			const signupPickPlanPage = new SignupPickPlanPage( page, selectedFreeDomain );
			newSiteDetails = await signupPickPlanPage.selectPlan( 'Free' );
		} );
	} );

	describe( 'Onboarding', function () {
		let startSiteFlow: StartSiteFlow;

		beforeAll( async function () {
			startSiteFlow = new StartSiteFlow( page );
		} );

		it( 'Enter Onboarding flow for the selected domain', async function () {
			await expect(
				page.waitForURL( /setup\/site-setup\/goals\?/, { timeout: 30 * 1000 } )
			).resolves.not.toThrow();

			const urlRegex = `/setup/site-setup/goals?siteSlug=${ selectedFreeDomain }`;
			expect( page.url() ).toMatch( urlRegex );
		} );

		it( 'Select "Write" goal', async function () {
			await startSiteFlow.selectGoal( 'Write' );
			await startSiteFlow.clickButton( 'Continue' );
		} );

		it( 'Enter blog name', async function () {
			await startSiteFlow.enterBlogName( blogName );
		} );

		it( 'Enter blog tagline', async function () {
			await startSiteFlow.enterTagline( blogTagLine );
			await startSiteFlow.clickButton( 'Continue' );
		} );
	} );

	describe( 'Write', function () {
		const postTitle = DataHelper.getRandomPhrase();

		let startSiteFlow: StartSiteFlow;
		let editorPage: EditorPage;

		beforeAll( async function () {
			startSiteFlow = new StartSiteFlow( page );
		} );

		it( 'Write first post', async function () {
			await startSiteFlow.clickWriteAction( 'Start writing' );
		} );

		it( 'Editor loads', async function () {
			editorPage = new EditorPage( page );
			await editorPage.waitUntilLoaded();

			await page.waitForURL( new RegExp( newSiteDetails.blog_details.site_slug ) );
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
		it( 'Launchpad is shown', async function () {
			await page.waitForURL( /launchpad/ );
		} );

		it( 'Launch site', async function () {
			await page.getByRole( 'button', { name: 'Launch your site' } ).click();

			await page.waitForURL( /setup\/write\/processing/ );
		} );

		it( 'Post-launch congratulatory message is shown', async function () {
			// User is redirected to the Home dashboard.
			await page.waitForURL( /home/ );

			await page.getByRole( 'dialog' ).getByRole( 'heading', { name: 'Congrats' } ).waitFor();
		} );

		it( 'Close congratulatory message', async function () {
			await page.getByRole( 'dialog' ).getByRole( 'button', { name: 'Close' } ).click();
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
