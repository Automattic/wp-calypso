/**
 * @group calypso-pr
 */

import {
	DataHelper,
	DomainSearchComponent,
	EditorPage,
	GeneralSettingsPage,
	MyHomePage,
	SignupPickPlanPage,
	StartSiteFlow,
	TestAccount,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Hero Flow: Build' ), () => {
	const themeName = 'Blockbase';
	const siteName = DataHelper.getBlogName();
	const siteSlug = siteName + '.wordpress.com';

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
		 * @param siteName Site subdomain
		 */
		await page.goto( DataHelper.getCalypsoURL( '/start' ) );

		// Select a free domain
		const domainSearchComponent = new DomainSearchComponent( page );
		await domainSearchComponent.search( siteName );
		await domainSearchComponent.selectDomain( '.wordpress.com' );

		// Select the free plan
		const signupPickPlanPage = new SignupPickPlanPage( page );
		await signupPickPlanPage.selectPlan( 'Start with Free' );
	} );

	/**
	 * Navigate to the set up site screen for the Build flow as a resusable function
	 *
	 */
	const navigateToBuildPath = () => {
		it( 'Navigate to intent screen', async () => {
			await page.goto( DataHelper.getCalypsoURL( '/start/setup-site/intent', { siteSlug } ) );
		} );

		it( 'Select Build', async () => {
			await startSiteFlow.clickButton( 'Start building' );
		} );

		it( 'See select theme screen', async () => {
			await startSiteFlow.validateOnDesignPickerScreen();
		} );
	};

	/**
	 * Select a theme to finish onboarding and land in the editor
	 *
	 * @param themeName Theme to select from theme picker
	 */
	describe( 'Complete onboarding', () => {
		navigateToBuildPath();

		it( 'Choose a theme', async () => {
			await startSiteFlow.selectTheme( themeName );
		} );

		it( 'See the site editor', async () => {
			const editorPage = new EditorPage( page );
			await editorPage.validateOnEditorPage();
		} );
	} );

	/**
	 * Skip selecting a theme and land on MyHome
	 *
	 */
	describe( 'Skip onboarding', () => {
		navigateToBuildPath();

		it( 'Click Skip for now button', async () => {
			await startSiteFlow.clickButton( 'Skip for now' );
		} );

		it( 'See the home page', async () => {
			const myHomePage = new MyHomePage( page );
			await myHomePage.validateOnMyHomePage();
		} );
	} );

	afterAll( async () => {
		/**
		 * Delete the site created in this spec
		 *
		 * @param siteName Subdomain of the site
		 * @param siteSlug Full site URL
		 */
		await page.goto( DataHelper.getCalypsoURL( '/settings/general/', { siteSlug } ) );

		// Select which site will be deleted
		const generalSettingsPage = new GeneralSettingsPage( page );
		await generalSettingsPage.confirmSiteToDelete( siteSlug );
		await generalSettingsPage.clickConfirmSiteLink( `${ siteName }.wordpress.com` );

		// Delete the site
		await generalSettingsPage.deleteSite( `${ siteName }.wordpress.com` );
	} );
} );
