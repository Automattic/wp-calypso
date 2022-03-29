/**
 * @group calypso-pr
 */

import { DataHelper, StartSiteFlow, MyHomePage, TestAccount } from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Hero Flow' ), () => {
	const theme = 'Quadrat Green';

	let page: Page;
	let startSiteFlow: StartSiteFlow;

	beforeAll( async () => {
		page = await browser.newPage();
		startSiteFlow = new StartSiteFlow( page );

		const testAccount = new TestAccount( 'defaultUser' );
		await testAccount.authenticate( page );
	} );

	/**
	 * Start the build flow from the intent screen
	 *
	 * @param siteSlug The site slug URL.
	 */
	const startBuildFlow = ( siteSlug = 'e2eflowtesting4.wordpress.com' ) => {
		it( 'Navigate to /start/intent', async function () {
			await page.goto( DataHelper.getCalypsoURL( '/start/setup-site/intent', { siteSlug } ) );
		} );

		it( 'Select "Build" path', async function () {
			startSiteFlow = new StartSiteFlow( page );
			await startSiteFlow.clickButton( 'Start building' );
		} );
	};

	describe( 'Preview and choose a design', function () {
		startBuildFlow();

		it( 'See design picker screen', async function () {
			await startSiteFlow.validateOnDesignPickerScreen();
		} );

		it( 'Preview a free theme', async function () {
			await startSiteFlow.previewTheme( theme );
		} );

		it( 'Preview the selected theme', async function () {
			await startSiteFlow.getThemePreviewIframe();
			await page.waitForResponse(
				( res ) => res.url().includes( '/template/demo/pub' ) && res.status() === 200
			);
		} );

		it( `Select "Start with ${ theme } and land in site editor`, async function () {
			await Promise.all( [
				page.waitForResponse(
					( res ) => res.url().includes( '/wp-admin/themes.php' ) && res.status() === 200
				),
				startSiteFlow.clickButton( `Start with ${ theme }` ),
			] );
		} );
	} );

	describe( 'Skip choosing a design', function () {
		startBuildFlow();

		it( 'See design picker screen', async function () {
			await startSiteFlow.validateOnDesignPickerScreen();
		} );

		it( 'Click "Skip for now', async function () {
			await startSiteFlow.clickButton( 'Skip for now' );
		} );

		it( 'Validate redirection to My Home', async function () {
			const myHomePage = new MyHomePage( page );
			await myHomePage.validateHomePage();
		} );
	} );
} );
