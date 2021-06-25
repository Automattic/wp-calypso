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
		const themeName = 'Twenty Twenty';
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

		it( `Select ${ themeName }`, async function () {
			await themesPage.select( themeName );
		} );

		it( 'See theme detail page', async function () {
			themesDetailPage = await ThemesDetailPage.Expect( this.page );
		} );

		it( 'Activate theme', async function () {
			await this.page.pause();
			await themesDetailPage.activate();
		} );
	} );
} );
