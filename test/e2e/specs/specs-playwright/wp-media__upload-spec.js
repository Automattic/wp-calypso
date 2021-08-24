/**
 * @group calypso-pr
 */

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
<<<<<<< HEAD
	let testFiles;
=======
	const testFiles = [
		{ type: 'image', file: MediaHelper.createTestImage() },
		{ type: 'audio', file: MediaHelper.createTestAudio() },
	];
	const invalidFile = MediaHelper.createUnsupportedFile();
>>>>>>> 72b7813078 (Define and implement interface for TestFile.)
	let page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	beforeAll( async () => {
		testFiles = {
			image: await MediaHelper.createTestImage(),
			audio: await MediaHelper.createTestAudio(),
			invalid: await MediaHelper.createInvalidFile(),
		};
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

<<<<<<< HEAD
		it( 'Upload image and confirm addition to gallery', async () => {
			const uploadedItem = await mediaPage.upload( testFiles.image );
			assert.strictEqual( await uploadedItem.isVisible(), true );
		} );

		it( 'Upload audio and confirm addition to gallery', async () => {
			const uploadedItem = await mediaPage.upload( testFiles.audio );
=======
		it.each( testFiles )( 'Upload $type and confirm addition to gallery', async ( { file } ) => {
			const uploadedItem = await mediaPage.upload( file.fullpath );
>>>>>>> 72b7813078 (Define and implement interface for TestFile.)
			assert.strictEqual( await uploadedItem.isVisible(), true );
		} );

		it( 'Upload an unsupported file type and see the rejection notice', async function () {
			try {
<<<<<<< HEAD
				await mediaPage.upload( testFiles.invalid );
=======
				await mediaPage.upload( invalidFile.fullpath );
>>>>>>> 72b7813078 (Define and implement interface for TestFile.)
			} catch ( error ) {
				assert.match( error.message, /could not be uploaded/i );
			}
		} );
	} );
<<<<<<< HEAD
=======

	// Clean up test files.
	afterAll( () => {
		for ( const testFile of Object.values( testFiles ) ) {
			MediaHelper.deleteFile( testFile.file.fullpath );
		}
		MediaHelper.deleteFile( invalidFile.fullpath );
	} );
>>>>>>> 72b7813078 (Define and implement interface for TestFile.)
} );
