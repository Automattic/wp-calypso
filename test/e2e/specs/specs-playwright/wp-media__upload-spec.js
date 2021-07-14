import assert from 'assert';
import {
	setupHooks,
	DataHelper,
	LoginFlow,
	MediaPage,
	SidebarComponent,
	MediaHelper,
} from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Media: Upload' ), () => {
	const testFiles = {
		image: MediaHelper.createTestImage(),
		audio: MediaHelper.createTestAudio(),
	};
	const invalidFile = MediaHelper.createInvalidFile();
	let page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	// Parametrized test.
	describe.each`
		siteType      | user
		${ 'Simple' } | ${ 'defaultUser' }
		${ 'Atomic' } | ${ 'wooCommerceUser' }
	`( 'Upload media files ($siteType)', ( { user } ) => {
		let mediaPage;

		it( 'Log In', async function () {
			const loginFlow = new LoginFlow( page, user );
			await loginFlow.logIn();
		} );

		it( 'Navigate to Media', async function () {
			const sidebarComponent = await SidebarComponent.Expect( page );
			await sidebarComponent.gotoMenu( { item: 'Media' } );
		} );

		it( 'See media gallery', async function () {
			mediaPage = await MediaPage.Expect( page );
		} );

		Object.entries( testFiles ).forEach( function ( [ key, value ] ) {
			it( `Upload ${ key } and confirm addition to gallery`, async function () {
				const uploadedItem = await mediaPage.upload( value );
				assert.strictEqual( await uploadedItem.isVisible(), true );
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

	// Clean up test files.
	afterAll( () => {
		for ( const filepath of Object.values( testFiles ) ) {
			MediaHelper.deleteFile( filepath );
		}
		MediaHelper.deleteFile( invalidFile );
	} );
} );
