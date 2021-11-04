/**
 * @group calypso-pr
 */

import assert from 'assert';
import {
	DataHelper,
	LoginPage,
	MediaPage,
	SidebarComponent,
	MediaHelper,
	TestFile,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';
import { setupHooks } from '../../lib/jest/setup-hooks';
import { TEST_IMAGE_PATH, TEST_AUDIO_PATH, UNSUPPORTED_FILE_PATH } from '../constants';

describe( DataHelper.createSuiteTitle( 'Media: Upload' ), () => {
	let testFiles: { image: TestFile; audio: TestFile; unsupported: TestFile };
	let page: Page;

	setupHooks( ( createdPage ) => {
		page = createdPage;
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
		${ 'Atomic' } | ${ 'eCommerceUser' }
	`( 'Upload media files ($siteType)', ( { user } ) => {
		let mediaPage: MediaPage;

		it( 'Log In', async function () {
			const loginPage = new LoginPage( page );
			await loginPage.login( { account: user } );
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
