/**
 * @group calypso-pr
 */

import assert from 'assert';
import {
	setupHooks,
	DataHelper,
	LoginPage,
	MediaPage,
	SidebarComponent,
	MediaHelper,
	TestFile,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';
import { TEST_IMAGE_PATH, TEST_AUDIO_PATH, TEST_UNSUPPORTED_FILE_PATH } from '../constants';

describe( DataHelper.createSuiteTitle( 'Media: Upload' ), () => {
	let testFiles: { image: TestFile; audio: TestFile; unsupported: TestFile };
	let page: Page;
	let loginPage: LoginPage;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	beforeAll( async () => {
		testFiles = {
			image: await MediaHelper.createTestFile( TEST_IMAGE_PATH ),
			audio: await MediaHelper.createTestFile( TEST_AUDIO_PATH ),
			unsupported: await MediaHelper.createTestFile( TEST_UNSUPPORTED_FILE_PATH ),
		};
		loginPage = new LoginPage( page );
		await loginPage.visit();
	} );

	// Parametrized test.
	describe.each`
		siteType      | testAccount
		${ 'Simple' } | ${ 'defaultUser' }
		${ 'Atomic' } | ${ 'eCommerceUser' }
	`( 'Upload media files ($siteType)', ( { testAccount } ) => {
		let mediaPage: MediaPage;

		afterAll( async () => {
			await loginPage.visit();
			await loginPage.clickChangeAccount();
		} );

		it( `Log in with ${ testAccount }`, async function () {
			await loginPage.logInWithTestAccount( testAccount );
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
