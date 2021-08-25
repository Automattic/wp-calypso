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
	let testFiles;
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

		it( 'Upload image and confirm addition to gallery', async () => {
			const uploadedItem = await mediaPage.upload( testFiles.image );
			assert.strictEqual( await uploadedItem.isVisible(), true );
		} );

		it( 'Upload audio and confirm addition to gallery', async () => {
			const uploadedItem = await mediaPage.upload( testFiles.audio );
			assert.strictEqual( await uploadedItem.isVisible(), true );
		} );

		it( 'Upload an unsupported file type and see the rejection notice', async function () {
			try {
				await mediaPage.upload( testFiles.invalid );
			} catch ( error ) {
				assert.match( error.message, /could not be uploaded/i );
			}
		} );
	} );
} );
