import {
	DataHelper,
	LoginFlow,
	SidebarComponent,
	ThemesPage,
	ThemesDetailPage,
	setupHooks,
} from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Theme: Preview' ), () => {
	let sidebarComponent;
	let themesPage;
	let themesDetailPage;
	const themeName = 'Twenty Seventeen';
	let page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( 'Log In', async function () {
		const loginFlow = new LoginFlow( page );
		await loginFlow.logIn();
	} );

	it( 'Navigate to Themes', async function () {
		sidebarComponent = await SidebarComponent.Expect( page );
		await sidebarComponent.gotoMenu( { item: 'Appearance' } );
	} );

	it( 'Search for free theme', async function () {
		themesPage = await ThemesPage.Expect( page );
		await themesPage.filterThemes( 'Free' );
		await themesPage.search( themeName );
	} );

	it( `Select ${ themeName }`, async function () {
		await themesPage.select( themeName );
	} );

	it( 'See theme detail page', async function () {
		themesDetailPage = await ThemesDetailPage.Expect( page );
	} );

	it( 'Preview theme', async function () {
		await themesDetailPage.preview();
	} );
} );
