/**
 * @group calypso-pr
 * @group jetpack-remote-site
 */

import {
	DataHelper,
	PreviewComponent,
	ThemesPage,
	ThemesDetailPage,
	SiteSelectComponent,
	TestAccount,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
} from '@automattic/calypso-e2e';
import { getCalypsoURL } from '@automattic/calypso-e2e/dist/types/src/data-helper';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Theme: Preview and Activate' ), () => {
	const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );
	const testAccount = new TestAccount( accountName );
	const testAccountSiteDomain = testAccount.getSiteURL( { protocol: false } );
	let themesPage: ThemesPage;
	let themesDetailPage: ThemesDetailPage;
	let previewComponent: PreviewComponent;
	let popupTab: Page;
	let page: Page;
	// This test will use partial matching names to cycle between available themes.
	const themeName = 'Twenty Twen';

	beforeAll( async () => {
		page = await browser.newPage();

		await testAccount.authenticate( page );
	} );

	it( 'Navigate to Appearance > Themes', async function () {
		/**
		 * Temporarily disabled sidebar code due to the Untangling Calypso & Nav Redesign project.
		 * Awaiting final UI design.
		 * @see https://github.com/Automattic/wp-calypso/pull/87477
		 */
		page.goto( getCalypsoURL( `themes/${ testAccount.getSiteURL( { protocol: false } ) }` ) );
		// sidebarComponent = new SidebarComponent( page );
		// await sidebarComponent.navigate( 'Appearance', 'Themes' );
	} );

	it( `Choose test site ${ testAccountSiteDomain } if Site Selector is shown`, async function () {
		const siteSelectComponent = new SiteSelectComponent( page );

		if ( await siteSelectComponent.isSiteSelectorVisible() ) {
			await siteSelectComponent.selectSite( testAccountSiteDomain );
		}
	} );

	it( `Search for theme with keyword ${ themeName }`, async function () {
		themesPage = new ThemesPage( page );
		await themesPage.search( themeName );
	} );

	it( `Select and view details of a theme starting with ${ themeName }`, async function () {
		const selectedTheme = await themesPage.select( themeName );
		await themesPage.hoverThenClick( selectedTheme );
	} );

	it( 'Preview theme', async function () {
		themesDetailPage = new ThemesDetailPage( page );
		await themesDetailPage.preview();
		previewComponent = new PreviewComponent( page );
		await previewComponent.previewReady();
	} );

	it( 'Close theme preview', async function () {
		await previewComponent.closePreview();
	} );

	it.skip( 'Activate theme', async function () {
		await themesDetailPage.activate();
	} );

	it.skip( 'Open theme customizer', async function () {
		popupTab = await themesDetailPage.customizeSite();
		await popupTab.waitForLoadState( 'load' );
	} );

	it.skip( 'Close theme customizer', async function () {
		await popupTab.close();
	} );
} );
