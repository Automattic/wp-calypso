/**
 * @group calypso-pr
 */

import {
	DataHelper,
	DomainSearchComponent,
	EditorPage,
	GeneralSettingsPage,
	SignupPickPlanPage,
	StartSiteFlow,
	TestAccount,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Hero Flow: Sell' ), () => {
	const themeName = 'Dorna';
	const storeName = DataHelper.getBlogName();
	const tagline = `${ storeName } tagline`;
	const siteSlug = storeName + '.wordpress.com';

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
		 * @param storeName Site subdomain
		 */
		await page.goto( DataHelper.getCalypsoURL( '/start' ) );

		// Select a free domain
		const domainSearchComponent = new DomainSearchComponent( page );
		await domainSearchComponent.search( storeName );
		await domainSearchComponent.selectDomain( '.wordpress.com' );

		// Select the free plan
		const signupPickPlanPage = new SignupPickPlanPage( page );
		await signupPickPlanPage.selectPlan( 'Start with Free' );
	} );

	/**
	 * Navigate to the set up site screen for the Sell flow as a resusable function
	 *
	 */
	const navigateToSellPath = () => {
		it( 'Navigate to intent screen', async () => {
			await page.goto( DataHelper.getCalypsoURL( '/start/setup-site/intent', { siteSlug } ) );
		} );

		it( 'Select Sell', async () => {
			await startSiteFlow.clickButton( 'Start selling' );
		} );
	};

	/**
	 * Skip optional site setup screen, select start simple options, and verify navigation to design picker screen
	 */
	const selectStartSimpleStore = () => {
		it( 'Click Skip This Step button', async () => {
			await startSiteFlow.clickButton( 'Skip this step' );
		} );

		it( 'Select start simple option', async () => {
			await startSiteFlow.clickButton( 'Continue' );
		} );

		it( 'See design picker screen', async () => {
			await startSiteFlow.validateOnDesignPickerScreen();
		} );
	};

	/**
	 * Complete optional site setup screen and verify navigation to store features screen
	 *
	 * @param storeName Site subdomain
	 * @param tagline Store tagline
	 */
	describe( 'Complete optional store settings', () => {
		navigateToSellPath();

		it( 'Enter Store name', async () => {
			await startSiteFlow.enterSiteName( storeName );
		} );

		it( 'Enter Store tagline', async () => {
			await startSiteFlow.enterTagline( tagline );
		} );

		it( 'Click continue button', async () => {
			await startSiteFlow.clickButton( 'Continue' );
		} );

		it( 'See store features screen', async () => {
			await startSiteFlow.validateOnStoreFeaturesScreen();
		} );
	} );

	/**
	 * Select a theme to finish onboarding and land in the editor
	 *
	 * @param themeName Theme to select from theme picker
	 */
	describe( 'Complete onbaording', () => {
		navigateToSellPath();

		selectStartSimpleStore();

		it( 'Choose a theme', async () => {
			await startSiteFlow.selectTheme( themeName );
		} );

		it( 'See the site editor', async () => {
			const editorPage = new EditorPage( page );
			await editorPage.validateOnEditorPage();
		} );
	} );

	/**
	 * Skip selecting a theme and land in editor
	 *
	 */
	describe( 'Skip onboarding', () => {
		navigateToSellPath();

		selectStartSimpleStore();

		it( 'Click Skip for now button', async () => {
			await startSiteFlow.clickButton( 'Skip for now' );
		} );

		it( 'See the site editor', async () => {
			const editorPage = new EditorPage( page );
			await editorPage.validateOnEditorPage();
		} );
	} );

	/**
	 * Skip optional site setup screen, select more power option, and verify navigation to store address screen
	 * This test stops at the start of the path setup WooCommerce
	 */
	describe( 'Select more power store path', () => {
		navigateToSellPath();

		it( 'Click Skip This Step button', async () => {
			await startSiteFlow.clickButton( 'Skip this step' );
		} );

		it( 'Select more power option', async () => {
			await startSiteFlow.clickButton( 'Upgrade' );
		} );

		it( 'See the WooCommerce sign up screen', async () => {
			await startSiteFlow.validateOnWooCommerceScreen();
		} );
	} );

	afterAll( async () => {
		/**
		 * Delete the site created in this spec
		 *
		 * @param siteSlug Site full url
		 * @param storeName Site subdomain
		 */
		await page.goto( DataHelper.getCalypsoURL( '/settings/general/', { siteSlug } ) );

		// Select which site will be deleted
		const generalSettingsPage = new GeneralSettingsPage( page );
		await generalSettingsPage.confirmSiteToDelete( siteSlug );
		await generalSettingsPage.clickConfirmSiteLink( `${ storeName }.wordpress.com` );

		// Delete the site
		await generalSettingsPage.deleteSite( `${ storeName }.wordpress.com` );
	} );
} );
