/**
 * External dependencies
 */
import {
	DataHelper,
	LoginFlow,
	SidebarComponent,
	ThemesPage,
	ThemesDetailPage,
} from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Theme: Activate' ), function () {
	describe( 'Free theme from theme details page', function () {
		let sidebarComponent;
		let themesPage;
		let themesDetailPage;
		const themeName = 'Twenty Twen';
		const user = 'defaultUser';

		it( 'Log In', async function () {
			const loginFlow = new LoginFlow( this.page, user );
			await loginFlow.logIn();
		} );

		it( 'Navigate to Themes', async function () {
			sidebarComponent = await SidebarComponent.Expect( this.page );
			await sidebarComponent.gotoMenu( { item: 'Appearance' } );
		} );

		it( 'Search for free theme', async function () {
			themesPage = await ThemesPage.Expect( this.page );
			await themesPage.filterThemes( 'Free' );
			await themesPage.search( themeName );
		} );

		it( `Select a theme starting with ${ themeName }`, async function () {
			await themesPage.select( themeName );
		} );

		it( 'Activate theme', async function () {
			themesDetailPage = await ThemesDetailPage.Expect( this.page );
			await themesDetailPage.activate();
		} );

		it( 'Load theme customizer', async function () {
			await themesDetailPage.customizeSite();
		} );
	} );
} );
