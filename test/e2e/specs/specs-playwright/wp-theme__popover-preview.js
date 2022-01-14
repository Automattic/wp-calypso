/**
 * @group calypso-pr
 */

import {
	DataHelper,
	SidebarComponent,
	ThemesPage,
	PreviewComponent,
	SiteSelectComponent,
	TestAccount,
} from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Theme: Preview' ), () => {
	// This test will use this specific theme as it will never be active.
	const themeName = 'Twenty Seventeen';
	const testAccount = new TestAccount( 'defaultUser' );
	const testAccountSiteDomain = testAccount.getSiteURL( { protocol: false } );

	let sidebarComponent;
	let themesPage;
	let previewComponent;
	let page;

	beforeAll( async () => {
		page = await global.browser.newPage();
		await testAccount.authenticate( page );
	} );

	it( 'Navigate to Themes', async function () {
		sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.navigate( 'Appearance', 'Themes' );
	} );

	it( `Choose test site ${ testAccountSiteDomain } if Site Selector is shown`, async function () {
		const siteSelectComponent = new SiteSelectComponent( page );

		if ( await siteSelectComponent.isSiteSelectorVisible() ) {
			await siteSelectComponent.selectSite( testAccountSiteDomain );
		}
	} );

	it( `Search for free theme with keyword ${ themeName }`, async function () {
		themesPage = new ThemesPage( page );
		// 2021-11-29: Turn this on when premium themes are activated for everyone. -mreishus
		// await themesPage.filterThemes( 'Free' );
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
