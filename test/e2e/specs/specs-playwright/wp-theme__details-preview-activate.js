import {
	setupHooks,
	DataHelper,
	LoginFlow,
	SidebarComponent,
	PreviewComponent,
	ThemesPage,
	ThemesDetailPage,
} from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Theme: Preview and Activate' ), () => {
	let sidebarComponent;
	let themesPage;
	let themesDetailPage;
	let previewComponent;
	let popupTab;
	let page;
	// This test will use partial matching names to cycle between available themes.
	const themeName = 'Twenty Twen';
	const user = 'defaultUser';

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( 'Log In', async function () {
		const loginFlow = new LoginFlow( page, user );
		await loginFlow.logIn();
	} );

	it( 'Navigate to Appearance > Themes', async function () {
		sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.gotoMenu( { item: 'Appearance', subitem: 'Themes' } );
	} );

	it( `Search for free theme with keyword ${ themeName }`, async function () {
		themesPage = await ThemesPage.Expect( page );
		await themesPage.filterThemes( 'Free' );
		await themesPage.search( themeName );
	} );

	it( `Select and view details of a theme starting with ${ themeName }`, async function () {
		const selectedTheme = await themesPage.select( themeName );
		await themesPage.hoverThenClick( selectedTheme );
	} );

	it( 'Preview theme', async function () {
		themesDetailPage = await ThemesDetailPage.Expect( page );
		await themesDetailPage.preview();
		previewComponent = new PreviewComponent( page );
		await previewComponent.previewReady();
	} );

	it( 'Close theme preview', async function () {
		await previewComponent.closePreview();
	} );

	it( 'Activate theme', async function () {
		await themesDetailPage.activate();
	} );

	it( 'Open theme customizer', async function () {
		popupTab = await themesDetailPage.customizeSite();
		await popupTab.waitForLoadState( 'load' );
	} );

	it( 'Close theme customizer', async function () {
		await popupTab.close();
	} );
} );
