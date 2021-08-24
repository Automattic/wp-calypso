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
	const testFiles = [
		{ type: 'image', filepath: MediaHelper.createTestImage() },
		{ type: 'audio', filepath: MediaHelper.createTestAudio() },
	];
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
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Media' );
		} );

		it( 'See media gallery', async function () {
			mediaPage = new MediaPage( page );
		} );

		it.each( testFiles )(
			'Upload $type and confirm addition to gallery',
			async ( { filepath } ) => {
				const uploadedItem = await mediaPage.upload( filepath );
				assert.strictEqual( await uploadedItem.isVisible(), true );
			}
		);

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
		for ( const testFile of Object.values( testFiles ) ) {
			MediaHelper.deleteFile( testFile.filepath );
		}
		MediaHelper.deleteFile( invalidFile );
	} );
} );
