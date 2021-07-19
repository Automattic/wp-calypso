import {
	DataHelper,
	LoginFlow,
	SidebarComponent,
	ThemesPage,
	PreviewComponent,
	setupHooks,
} from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Theme: Preview' ), () => {
	let sidebarComponent;
	let themesPage;
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

	it( `Search for free theme with keyword ${ themeName }`, async function () {
		themesPage = await ThemesPage.Expect( page );
		await themesPage.filterThemes( 'Free' );
		await themesPage.search( themeName );
	} );

	it( `Select ${ themeName } and click on Live Demo popover item`, async function () {
		const selectedTheme = await themesPage.select( themeName );
		await themesPage.clickPopoverItem( selectedTheme, 'Live Demo' );
	} );

	it( 'Preview theme', async function () {
		await PreviewComponent.Expect( page );
	} );
} );
