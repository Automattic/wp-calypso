/**
 * @group calypso-pr
 */

import {
	DataHelper,
	DomainSearchComponent,
	GeneralSettingsPage,
	StartSiteFlow,
	SignupPickPlanPage,
	TestAccount,
	EditorPage,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Hero Flow: Write' ), () => {
	const themeName = 'Blockbase';
	const blogName = DataHelper.getBlogName();
	const siteSlug = blogName + '.wordpress.com';

	let page: Page;
	let startSiteFlow: StartSiteFlow;

	beforeAll( async () => {
		page = await browser.newPage();
		startSiteFlow = new StartSiteFlow( page );

		const testAccount = new TestAccount( 'calypsoPreReleaseUser' );
		await testAccount.authenticate( page );

		/**
		 * Create a new site using existing test user 'calypsoPreReleaseUser'
		 * with a WordPress.com domain and a free plan
		 *
		 * @param blogName Site subdomain
		 */
		await page.goto( DataHelper.getCalypsoURL( '/start' ) );

		// Select a free domain
		const domainSearchComponent = new DomainSearchComponent( page );
		await domainSearchComponent.search( blogName );
		await domainSearchComponent.selectDomain( '.wordpress.com' );

		// Select the free plan
		const signupPickPlanPage = new SignupPickPlanPage( page );
		await signupPickPlanPage.selectPlan( 'Start with Free' );
	} );

	/**
	 * Complete the intent page and site setup page for the Write FLow
	 *
	 */
	const navigateToWritePath = () => {
		it( 'Navigate to intent page', async () => {
			await page.goto( DataHelper.getCalypsoURL( '/start/setup-site/intent', { siteSlug } ) );
		} );

		it( 'Select Write', async () => {
			await startSiteFlow.clickButton( 'Start writing' );
		} );
	};

	/**
	 * Complete optional but settings
	 *
	 * @param blogName The site subdomain
	 */
	describe( 'Complete optional blog settings', () => {
		navigateToWritePath();

		it( 'Enter Blog name', async () => {
			await startSiteFlow.enterSiteName( blogName );
		} );

		it( 'Enter Blog tagline', async () => {
			await startSiteFlow.enterTagline( 'Hero Flow Blog' );
		} );

		it( 'Click continue button', async () => {
			await startSiteFlow.clickButton( 'Continue' );
		} );
	} );

	/**
	 * Select start writing and go directly to the editor
	 */
	describe( 'Go directly to the editor', () => {
		navigateToWritePath();

		it( 'Click Skip this step button', async () => {
			await startSiteFlow.clickButton( 'Skip this step' );
		} );

		it( 'Click Start writing', async () => {
			await startSiteFlow.clickButton( 'Start writing ' );
		} );

		it( 'See the Courses screen', async () => {
			const editorPage = new EditorPage( page );
			await editorPage.validateOnEditorPage();
		} );
	} );

	/**
	 * Select start learning to view educational courses
	 */
	describe( 'Watch blogging videos', () => {
		navigateToWritePath();

		it( 'Click Skip this step button', async () => {
			await startSiteFlow.clickButton( 'Skip this step' );
		} );

		it( 'Click Start learning button', async () => {
			await startSiteFlow.clickButton( 'Start learning ' );
		} );

		it( 'See the Courses screen', async () => {
			await startSiteFlow.validateOnCoursesScreen();
		} );
	} );

	/**
	 * Select a theme and land in the editor
	 *
	 * @param themeName Theme to select from theme picker
	 */
	describe( 'Choose a theme', () => {
		navigateToWritePath();

		it( 'Click Skip this step button', async () => {
			await startSiteFlow.clickButton( 'Skip this step' );
		} );

		it( 'Click View designs button ', async () => {
			await startSiteFlow.clickButton( 'View designs' );
		} );

		it( 'Choose a theme', async () => {
			await startSiteFlow.selectTheme( themeName );
		} );

		it( 'See the site editor', async () => {
			const editorPage = new EditorPage( page );
			await editorPage.validateOnEditorPage();
		} );
	} );

	/**
	 * Skip selecting a theme and land in the editor
	 */
	describe( 'Skip selecting a theme', () => {
		navigateToWritePath();

		it( 'Click Skip this step button', async () => {
			await startSiteFlow.clickButton( 'Skip this step' );
		} );

		it( 'Click View designs button ', async () => {
			await startSiteFlow.clickButton( 'View designs' );
		} );

		it( 'Click Skip and draft first post button', async () => {
			await startSiteFlow.clickButton( 'Skip and draft first post' );
		} );

		it( 'See the site editor', async () => {
			const editorPage = new EditorPage( page );
			await editorPage.validateOnEditorPage();
		} );
	} );

	afterAll( async () => {
		/**
		 * Delete the site created in this spec
		 *
		 * @param blogName The subdomain of the site
		 * @param siteSlug The full site url
		 */
		await page.goto( DataHelper.getCalypsoURL( '/settings/general/', { siteSlug } ) );

		// Select which site will be deleted
		const generalSettingsPage = new GeneralSettingsPage( page );
		await generalSettingsPage.confirmSiteToDelete( siteSlug );
		await generalSettingsPage.clickConfirmSiteLink( `${ blogName }.wordpress.com` );

		// Delete the site
		await generalSettingsPage.deleteSite( `${ blogName }.wordpress.com` );
	} );
} );
