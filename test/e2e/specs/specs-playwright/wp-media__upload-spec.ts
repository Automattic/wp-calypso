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
	TestFile,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';
import { TEST_IMAGE_PATH, TEST_AUDIO_PATH, UNSUPPORTED_FILE_PATH } from '../constants';

describe( DataHelper.createSuiteTitle( 'Media: Upload' ), () => {
	let testFiles: { image: TestFile; audio: TestFile; unsupported: TestFile };
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	beforeAll( async () => {
		testFiles = {
			image: await MediaHelper.createTestFile( TEST_IMAGE_PATH ),
			audio: await MediaHelper.createTestFile( TEST_AUDIO_PATH ),
			unsupported: await MediaHelper.createTestFile( UNSUPPORTED_FILE_PATH ),
		};
	} );

	// Parametrized test.
	describe.each`
		siteType      | user
		${ 'Simple' } | ${ 'defaultUser' }
		${ 'Atomic' } | ${ 'wooCommerceUser' }
	`( 'Upload media files ($siteType)', ( { user } ) => {
		let mediaPage: MediaPage;

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
			await mediaPage.upload( testFiles.image.fullpath );
		} );

		it( 'Upload audio and confirm addition to gallery', async () => {
			await mediaPage.upload( testFiles.audio.fullpath );
		} );

		it( 'Upload an unsupported file type and see the rejection notice', async function () {
			try {
				await mediaPage.upload( testFiles.unsupported.fullpath );
			} catch ( error: unknown ) {
				if ( error instanceof Error ) {
					assert.match( error.message, /could not be uploaded/i );
				}
			}
		} );
	} );
} );
