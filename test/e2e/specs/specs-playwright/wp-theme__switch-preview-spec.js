/**
 * External dependencies
 */
import { LoginFlow, SidebarComponent } from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Theme: Preview' ), function () {
	let sidebarComponent;

	it( 'Log In', async function () {
		const loginFlow = new LoginFlow( this.page, user );
		await loginFlow.logIn();
	} );

	it( 'Navigate to Themes', async function () {
		sidebarComponent = await SidebarComponent.Expect( this.page );
		await sidebarComponent.gotoMenu( { item: 'Appearance', subitem: 'Themes' } );
	} );
} );
