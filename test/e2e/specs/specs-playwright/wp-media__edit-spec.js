/**
 * External dependencies
 */
import { DataHelper, LoginFlow, MediaPage, SidebarComponent } from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Media: Edit Media' ), function () {
	let mediaPage;

	it( 'Log In', async function () {
		const loginFlow = new LoginFlow( this.page );
		await loginFlow.login();
	} );

	it( 'Navigate to Media', async function () {
		const sidebarComponent = await SidebarComponent.Expect( this.page );
		await sidebarComponent.gotoMenu( { heading: 'Media' } );
	} );

	it( 'See media content', async function () {
		mediaPage = await MediaPage.Expect( this.page );
	} );

	it( 'Select the first media item', async function () {
		await mediaPage.click( { item: 1 } );
	} );

	it( 'Click to edit selected media', async function () {
		await mediaPage.editImage();
	} );

	it( 'Rotate image to the left', async function () {
		await mediaPage.rotateImage( { direction: 'left' } );
	} );

	it( 'Cancel image edit', async function () {
		await mediaPage.cancelEdit();
	} );
} );
