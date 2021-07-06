/**
 * External dependencies
 */
import { DataHelper, LoginFlow, MediaPage, SidebarComponent } from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Media: Edit Media' ), function () {
	// Parametrized test.
	[
		[ 'Simple', 'defaultUser' ],
		[ 'Atomic', 'wooCommerceUser' ],
	].forEach( function ( [ siteType, user ] ) {
		describe( `Edit Image (${ siteType })`, function () {
			let mediaPage;

			it( 'Log In', async function () {
				const loginFlow = new LoginFlow( this.page, user );
				await loginFlow.logIn();
			} );

			it( 'Navigate to Media', async function () {
				const sidebarComponent = await SidebarComponent.Expect( this.page );
				await sidebarComponent.gotoMenu( { item: 'Media' } );
			} );

			it( 'See media gallery', async function () {
				mediaPage = await MediaPage.Expect( this.page );
			} );

			it( 'Show only images', async function () {
				await mediaPage.clickTab( 'Images' );
			} );

			it( 'Select the first image item', async function () {
				await mediaPage.selectItem( 1 );
			} );

			it( 'Click to edit selected image', async function () {
				await mediaPage.editImage();
			} );

			it( 'Rotate image', async function () {
				await mediaPage.rotateImage();
			} );

			it( 'Cancel image edit', async function () {
				await mediaPage.cancelImageEdit();
			} );
		} );
	} );
} );
