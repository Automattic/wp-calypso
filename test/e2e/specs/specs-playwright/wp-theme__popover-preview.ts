/**
 * @group calypso-pr
 */

import {
	DataHelper,
	LoginPage,
	SidebarComponent,
	ThemesPage,
	PreviewComponent,
	SiteSelectComponent,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';
import { setupHooks } from '../../lib/jest/setup-hooks';

describe( DataHelper.createSuiteTitle( 'Theme: Preview' ), () => {
	let sidebarComponent: SidebarComponent;
	let themesPage: ThemesPage;
	let previewComponent: PreviewComponent;
	let page: Page;
	// This test will use this specific theme as it will never be active.
	const themeName = 'Twenty Seventeen';
	const user = 'defaultUser';
	const siteURL = DataHelper.getAccountSiteURL( user, { protocol: false } );

	setupHooks( ( createdPage ) => {
		page = createdPage;
	} );

	it( 'Log in', async function () {
		const loginPage = new LoginPage( page );
		await loginPage.login( { account: user } );
	} );

	it( 'Navigate to Themes', async function () {
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

	it( `Select ${ themeName } and click on Live Demo popover item`, async function () {
		const selectedTheme = await themesPage.select( themeName );
		await themesPage.clickPopoverItem( selectedTheme, 'Live Demo' );
	} );

	it( 'Preview theme', async function () {
		previewComponent = new PreviewComponent( page );
		await previewComponent.previewReady();
	} );

	it( 'Close preview', async function () {
		await previewComponent.closePreview();
	} );
} );
