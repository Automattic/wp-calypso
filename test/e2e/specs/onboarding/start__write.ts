/**
 * @group calypso-pr
 */

import {
	DataHelper,
	StartSiteFlow,
	MyHomePage,
	TestAccount,
	EditorPage,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Hero Flow' ), () => {
	const blogName = DataHelper.getBlogName();
	const tagline = `${ blogName } tagline`;
	const theme = 'Quadrat Green';

	let page: Page;
	let startSiteFlow: StartSiteFlow;

	beforeAll( async () => {
		page = await browser.newPage();
		startSiteFlow = new StartSiteFlow( page );

		const testAccount = new TestAccount( 'calypsoPreReleaseUser' );
		await testAccount.authenticate( page );
	} );

	/**
	 * Start the write flow from the intent screen
	 *
	 * @param siteSlug The site slug URL.
	 */
	const startWriteFlow = ( siteSlug = 'e2eflowtestingprereleaseuser2.wordpress.com' ) => {
		it( 'Navigate to /start/intent', async function () {
			await page.goto( DataHelper.getCalypsoURL( '/start/setup-site/intent', { siteSlug } ) );
		} );

		it( 'Select "Write" path', async function () {
			startSiteFlow = new StartSiteFlow( page );
			await startSiteFlow.clickButton( 'Start writing' );
		} );

		it( 'Enter blog name', async function () {
			await startSiteFlow.enterBlogName( blogName );
		} );

		it( 'Enter tagline', async function () {
			await startSiteFlow.enterTagline( tagline );
		} );

		it( 'Click continue', async function () {
			await startSiteFlow.clickButton( 'Continue' );
		} );
	};

	describe( '"Draft your first post" Flow', function () {
		startWriteFlow();

		it( 'Select "Draft your first post" path and land in editor', async function () {
			await Promise.all( [
				page.waitForNavigation( { url: /(\/post\/|\/wp-admin\/post-new.php)/ } ),
				startSiteFlow.clickButton( 'Start writing' ),
			] );
		} );
	} );

	describe( '"Skip to My Home" Flow', function () {
		startWriteFlow();

		it( 'Click "Skip to My Home', async function () {
			await startSiteFlow.clickButton( 'Skip to My Home' );
		} );

		it( 'Validate redirection to My Home', async function () {
			const myHomePage = new MyHomePage( page );
			await myHomePage.validateHomePage();
		} );
	} );

	describe( 'Preview and choose a design', function () {
		startWriteFlow();

		it( 'Select "Choose a design" path', async function () {
			await startSiteFlow.clickButton( 'View designs' );
		} );

		it( 'Validate preselected category filter', async function () {
			const currentCategory = await startSiteFlow.getCurrentCategory();
			expect( currentCategory ).toContain( 'Blog' );
		} );

		it( 'See design picker screen', async function () {
			await startSiteFlow.validateOnDesignPickerScreen();
		} );

		it( 'Preview a free theme', async function () {
			await startSiteFlow.previewTheme( theme );
		} );

		it( 'Preview the selected theme', async function () {
			const themePreviewIframe = await startSiteFlow.getThemePreviewIframe();
			const locator = themePreviewIframe.locator( `text=${ theme }` );
			await locator.waitFor();
		} );

		it( `Select "Start with ${ theme }" and land in editor`, async function () {
			await Promise.all( [
				page.waitForNavigation( { url: /(\/post\/|\/wp-admin\/post-new.php)/ } ),
				startSiteFlow.clickButton( `Start with ${ theme }` ),
			] );
		} );
	} );

	describe( 'Preview a design and skip to draft the first post', function () {
		startWriteFlow();

		it( 'Select "Choose a design" path', async function () {
			await startSiteFlow.clickButton( 'View designs' );
		} );

		it( 'Click "Skip and draft first post"', async function () {
			await Promise.all( [
				page.waitForNavigation( { url: /(\/post\/|\/wp-admin\/post-new.php)/ } ),
				startSiteFlow.clickButton( 'Skip and draft first post' ),
			] );
		} );

		it( 'Validate redirection to new post', async function () {
			const editorPage = new EditorPage( page );
			await editorPage.waitUntilLoaded();
			expect( await editorPage.editorHasBlockWarnings() ).toBe( false );
		} );
	} );
} );
