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
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Plugins: Browse' ), function () {
	let page: Page;
	let newSiteDetails: NewSiteResponse;

	beforeAll( async () => {
		page = await browser.newPage();
		const testUser = getTestAccountByFeature( envToFeatureKey( envVariables ), [
			{
				gutenberg: 'stable',
				siteType: 'simple',
				accountName: 'defaultUser',
			},
		] );
		const testAccount = new TestAccount( testUser );
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
			await page.goto( DataHelper.getCalypsoURL( `/setup/onboarding` ) );
		} );

		it( 'Skip domain selection', async function () {
			const signupDomainPage = new SignupDomainPage( page );
			await signupDomainPage.searchForFooDomains();
			await signupDomainPage.skipDomainSelection();
		} );

		it( `Select WordPress.com Free plan`, async function () {
			const signupPickPlanPage = new SignupPickPlanPage( page );
			newSiteDetails = await signupPickPlanPage.selectPlan( 'Free' );
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

		it( 'It will add subscribers', async function () {
			const addSubscribersButton = await page.getByText( 'Add subscribers' );
			await addSubscribersButton.waitFor();
			await addSubscribersButton.click();

			await page.goto(
				DataHelper.getCalypsoURL( `/home/${ newSiteDetails.blog_details.site_slug }` )
			);
		} );

		it( "It will write the user's first post", async function () {
			const writeFirstPostButton = await page.getByText( 'Write your first post' );
			await writeFirstPostButton.waitFor();
			await writeFirstPostButton.click();
		} );

		it( 'Editor loads', async function () {
			editorPage = new EditorPage( page );
			await editorPage.waitUntilLoaded();
			await new Promise( ( r ) => setTimeout( r, 2000 ) );
			await editorPage.closeWelcomeGuideIfNeeded();
		} );

		it( 'Enter blog title', async function () {
			await editorPage.enterTitle( 'my first post' );
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

			await page.goto(
				DataHelper.getCalypsoURL( `/home/${ newSiteDetails.blog_details.site_slug }` )
			);
			const launchSiteButton = await page.getByText( 'Launch your site' );
			await launchSiteButton.waitFor();
			await launchSiteButton.click();
		} );

		it( 'Make sure launch modal shows', async function () {
			const myHomePage = new MyHomePage( page );
			await myHomePage.validateTaskHeadingMessage( 'Congrats, your site is live!' );
		} );
	} );
} );
