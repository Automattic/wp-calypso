import {
	setupHooks,
	DataHelper,
	LoginFlow,
	SidebarComponent,
	ThemesPage,
	ThemesDetailPage,
} from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Theme: Activate' ), () => {
	let sidebarComponent;
	let themesPage;
	let themesDetailPage;
	let popupTab;
	let page;
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
		sidebarComponent = await SidebarComponent.Expect( page );
		await sidebarComponent.gotoMenu( { item: 'Appearance', subitem: 'Themes' } );
	} );

	it( 'Search for free theme', async function () {
		themesPage = await ThemesPage.Expect( page );
		await themesPage.filterThemes( 'Free' );
		await themesPage.search( themeName );
	} );

	it( `Select a theme starting with ${ themeName }`, async function () {
		await themesPage.select( themeName );
	} );

	it( 'Activate theme', async function () {
		themesDetailPage = await ThemesDetailPage.Expect( page );
		await themesDetailPage.activate();
	} );

	it( 'Theme customizer loads in a new tab', async function () {
		popupTab = await themesDetailPage.customizeSite();
		await popupTab.waitForLoadState( 'load' );
	} );

	it( 'Close theme customizer', async function () {
		await popupTab.close();
	} );
} );
