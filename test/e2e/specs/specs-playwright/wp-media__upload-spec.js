/**
 * External dependencies
 */
import {
	DataHelper,
	LoginFlow,
	MediaPage,
	SidebarComponent,
	MediaHelper,
} from '@automattic/calypso-e2e';
import assert from 'assert';

describe( DataHelper.createSuiteTitle( 'Media: Upload' ), function () {
	const testFiles = {
		image: MediaHelper.createTestImage(),
		audio: MediaHelper.createTestAudio(),
	};
	const invalidFile = MediaHelper.createInvalidFile();

	// Parametrized test.
	[
		[ 'Simple', 'defaultUser' ],
		[ 'Atomic', 'wooCommerceUser' ],
	].forEach( function ( [ siteType, user ] ) {
		describe( `Upload media files (${ siteType })`, function () {
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

			Object.entries( testFiles ).forEach( function ( [ key, value ] ) {
				it( `Upload ${ key } and confirm addition to gallery`, async function () {
					const uploadedItem = await mediaPage.upload( value );
					assert( await uploadedItem.isVisible() );
				} );
			} );

			it( 'Upload an unsupported file type and see the rejection notice', async function () {
				try {
					await mediaPage.upload( invalidFile );
				} catch ( error ) {
					assert.match( error.message, /could not be uploaded/i );
				}
			} );
		} );
	} );

	after( 'Clean up disk', async function () {
		for ( const filepath of Object.values( testFiles ) ) {
			MediaHelper.deleteFile( filepath );
		}
		MediaHelper.deleteFile( invalidFile );
	} );
} );
