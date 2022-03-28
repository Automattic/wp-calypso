/**
 * @group calypso-pr
 * @group jetpack
 */

import {
	DataHelper,
	SidebarComponent,
	ThemesPage,
	PreviewComponent,
	SiteSelectComponent,
	TestAccount,
} from '@automattic/calypso-e2e';
import { Browser, Page } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Theme: Preview' ), function () {
	// This test will use this specific theme as it will never be active.
	const themeName = 'Twenty Seventeen';
	const user = process.env.TARGET_JETPACK === '1' ? 'jetpackUser' : 'defaultUser';
	const testAccount = new TestAccount( user );
	const testAccountSiteDomain = testAccount.getSiteURL( { protocol: false } );

	let sidebarComponent: SidebarComponent;
	let themesPage: ThemesPage;
	let previewComponent: PreviewComponent;
	let page: Page;

	beforeAll( async () => {
		page = await browser.newPage();
		await testAccount.authenticate( page );
	} );

	it( 'Navigate to Appearance > Themes', async function () {
		sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.navigate( 'Appearance', 'Themes' );
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
