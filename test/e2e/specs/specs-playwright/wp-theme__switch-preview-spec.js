/**
 * External dependencies
 */
import { DataHelper, LoginFlow, SidebarComponent, ThemesPage, ThemesDetailPage } from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Theme: Preview' ), function () {
	let sidebarComponent;
	let themesPage;
	let themesDetailPage;
	const themeName = 'Twenty Seventeen';

	it( 'Log In', async function () {
		const loginFlow = new LoginFlow( this.page );
		await loginFlow.logIn();
	} );

	it( 'Navigate to Themes', async function () {
		sidebarComponent = await SidebarComponent.Expect( this.page );
		await sidebarComponent.gotoMenu( { item: 'Appearance' } );
	} );

	it( 'Search for free theme', async function() {
		themesPage = await ThemesPage.Expect( this.page );
		await themesPage.filterThemes( 'Free' );
		await themesPage.search( themeName );
	});

	it( 'Select Twenty Seventeen', async function() {
		await themesPage.select( themeName );
	});

	it( 'See theme detail page', async function() {
		themesDetailPage = await ThemesDetailPage.Expect( this.page );
	})

	it( 'Preview theme', async function() {
		await themesDetailPage.preview();
	})
} );
