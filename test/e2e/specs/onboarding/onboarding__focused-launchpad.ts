/**
 * @group calypso-release
 */
import {
	DataHelper,
	TestAccount,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
	BrowserManager,
	SignupDomainPage,
	SignupPickPlanPage,
	NewSiteResponse,
	StartSiteFlow,
	MyHomePage,
	EditorPage,
	RestAPIClient,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { apiDeleteSite } from '../shared';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Plugins: Browse' ), function () {
	let page: Page;
	let newSiteDetails: NewSiteResponse;
	let siteCreatedFlag = false;
	let testAccount: TestAccount;

	beforeAll( async () => {
		page = await browser.newPage();
		const testUser = getTestAccountByFeature( envToFeatureKey( envVariables ), [
			{
				gutenberg: 'stable',
				siteType: 'simple',
				accountName: 'defaultUser',
			},
		] );
		testAccount = new TestAccount( testUser );
		await testAccount.authenticate( page );
	} );

	describe( 'Log in, select a goal and theme', function () {
		const themeName = 'Retrospect';
		let startSiteFlow: StartSiteFlow;

		beforeAll( async function () {
			await BrowserManager.setStoreCookie( page, { currency: 'GBP' } );
			startSiteFlow = new StartSiteFlow( page );
		} );

		it( 'Visit onboarding page', async function () {
			await page.goto( DataHelper.getCalypsoURL( '/setup/onboarding' ) );
		} );

		it( 'Skip domain selection', async function () {
			const signupDomainPage = new SignupDomainPage( page );
			await signupDomainPage.searchForFooDomains();
			await signupDomainPage.skipDomainSelection();
		} );

		it( 'Select WordPress.com Free plan', async function () {
			const signupPickPlanPage = new SignupPickPlanPage( page );
			newSiteDetails = await signupPickPlanPage.selectPlan( 'Free' );

			siteCreatedFlag = true;
		} );

		it( 'Select "Publish a blog" goal', async function () {
			await startSiteFlow.selectGoal( 'Publish a blog' );
			await startSiteFlow.clickButton( 'Next' );
		} );

		it( 'Select theme', async function () {
			await startSiteFlow.selectTheme( themeName );
			await startSiteFlow.clickButton( 'Continue' );
		} );
	} );

	describe( 'Launch the site', function () {
		let editorPage: EditorPage;

		it( 'Visit Focused Launchpad page', async function () {
			const title = await page.getByText( "Let's get started!" );
			await title.waitFor( { timeout: 30 * 1000 } );
		} );

		it( 'Start building your audience', async function () {
			const addSubscribersButton = await page.getByText( 'Start building your audience' );
			await addSubscribersButton.waitFor();
			await addSubscribersButton.click();
			await new Promise( ( r ) => setTimeout( r, 1000 ) );

			await page.goto(
				DataHelper.getCalypsoURL( `/home/${ newSiteDetails.blog_details.site_slug }` )
			);
		} );

		it( 'Complete your profile', async function () {
			const completeProfileButton = await page.getByText( 'Complete your profile' );
			await completeProfileButton.waitFor();
			await completeProfileButton.click();
			await new Promise( ( r ) => setTimeout( r, 1000 ) );

			await page.goto(
				DataHelper.getCalypsoURL( `/home/${ newSiteDetails.blog_details.site_slug }` )
			);
		} );

		it( 'Give your site a name', async function () {
			const giveSiteNameButton = await page.getByText( 'Give your site a name' );
			await giveSiteNameButton.waitFor();
			await giveSiteNameButton.click();
		} );

		it( 'Once at the /wp-admin settings page, update site name', async function () {
			await page.fill( 'input[name="blogname"]', DataHelper.getRandomPhrase() );
			const saveChangesButton = await page.getByRole( 'button', { name: 'Save Changes' } );
			await saveChangesButton.click();

			// The first time we save, we need to wait for the page to reload because it redirects to Calypo's settings page
			// before loading /wp-admin settings page again, so we'd lose the settings updated notice
			// We can probably remove this after the ungangling is completed.
			await new Promise( ( r ) => setTimeout( r, 5000 ) );
			await saveChangesButton.click();
			// Wait for the success notice that appears after saving
			await page.waitForSelector( '#setting-error-settings_updated' );
			await page.goto(
				DataHelper.getCalypsoURL( `/home/${ newSiteDetails.blog_details.site_slug }` )
			);
		} );

		it( "It will write the user's first post", async function () {
			const writeFirstPostButton = await page.getByText( 'Write your first post' );
			await writeFirstPostButton.waitFor( { timeout: 30 * 1000 } );
			await writeFirstPostButton.click();
		} );

		it( 'Editor loads', async function () {
			editorPage = new EditorPage( page );
			await editorPage.waitUntilLoaded();
			await new Promise( ( r ) => setTimeout( r, 2000 ) );
			await editorPage.closeWelcomeGuideIfNeeded();
		} );

		it( 'Enter blog title', async function () {
			await editorPage.enterTitle( DataHelper.getRandomPhrase() );
		} );

		it( 'Publish post', async function () {
			await editorPage.publish();
			await page.goto(
				DataHelper.getCalypsoURL( `/home/${ newSiteDetails.blog_details.site_slug }` )
			);
		} );

		it( 'Should show Launch Site button and update title', async function () {
			const header = await page.getByText( "You're all set!" );
			await header.waitFor();
			const launchSiteButton = await page.getByText( 'Launch your site' );
			await launchSiteButton.waitFor();
			await launchSiteButton.click();
		} );

		it( 'Make sure launch modal shows', async function () {
			const myHomePage = new MyHomePage( page );
			await myHomePage.validateTaskHeadingMessage( 'Congrats, your site is live!' );
		} );
	} );

	afterAll( async function () {
		if ( ! siteCreatedFlag ) {
			return;
		}

		const restAPIClient = new RestAPIClient( {
			username: testAccount.credentials.username,
			password: testAccount.credentials.password,
		} );

		await apiDeleteSite( restAPIClient, {
			url: newSiteDetails.blog_details.url,
			id: newSiteDetails.blog_details.blogid,
			name: newSiteDetails.blog_details.blogname,
		} );
	} );
} );
