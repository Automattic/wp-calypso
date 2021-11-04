/**
 * @group calypso-pr
 */

import {
	DataHelper,
	LoginPage,
	SidebarComponent,
	PreviewComponent,
	ThemesPage,
	ThemesDetailPage,
	SiteSelectComponent,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';
import { setupHooks } from '../../lib/jest/setup-hooks';

describe( DataHelper.createSuiteTitle( 'Theme: Preview and Activate' ), () => {
	let sidebarComponent: SidebarComponent;
	let themesPage: ThemesPage;
	let themesDetailPage: ThemesDetailPage;
	let previewComponent: PreviewComponent;
	let popupTab: Page;
	let page: Page;
	// This test will use partial matching names to cycle between available themes.
	const themeName = 'Twenty Twen';
	const user = 'defaultUser';
	const siteURL = DataHelper.getAccountSiteURL( user, { protocol: false } );

	setupHooks( ( createdPage ) => {
		page = createdPage;
	} );

	it( 'Log in', async function () {
		const loginPage = new LoginPage( page );
		await loginPage.login( { account: user } );
	} );

	it( 'Navigate to Appearance > Themes', async function () {
		sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.navigate( 'Appearance', 'Themes' );
	} );

	it( `Choose test site ${ siteURL } if Site Selector is shown`, async function () {
		const siteSelectComponent = new SiteSelectComponent( page );

		if ( await siteSelectComponent.isSiteSelectorVisible() ) {
			await siteSelectComponent.selectSite( siteURL );
		}
	} );

	it( `Search for free theme with keyword ${ themeName }`, async function () {
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
