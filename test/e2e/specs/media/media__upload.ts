/**
 * @group calypso-loop
 * @group jetpack-remote-site
 * @group jetpack-wpcom-integration
 */

import assert from 'assert';
import {
	DataHelper,
	MediaPage,
	SidebarComponent,
	MediaHelper,
	TestFile,
	TestAccount,
	getTestAccountByFeature,
	envToFeatureKey,
	envVariables,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { TEST_IMAGE_PATH, TEST_AUDIO_PATH, TEST_UNSUPPORTED_FILE_PATH } from '../constants';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Media: Upload' ), () => {
	let testFiles: { image: TestFile; audio: TestFile; unsupported: TestFile };
	let page: Page;

	const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ), [
		{
			gutenberg: 'stable',
			siteType: 'simple',
			accountName: 'simpleSitePersonalPlanUser',
		},
	] );

	beforeAll( async () => {
		testFiles = {
			image: await MediaHelper.createTestFile( TEST_IMAGE_PATH ),
			audio: await MediaHelper.createTestFile( TEST_AUDIO_PATH ),
			unsupported: await MediaHelper.createTestFile( TEST_UNSUPPORTED_FILE_PATH ),
		};
	} );

	// If any of the tests start failing unexpectedly and permanently, check the following:
	// - ensure that plans, where appropriate, are enabled for the users;
	// - ensure with MarTech that nothing with plans have changed;
	describe( 'Upload media files ($siteType)', () => {
		let mediaPage: MediaPage;
		let testAccount: TestAccount;

		beforeAll( async () => {
			page = await browser.newPage();

			testAccount = new TestAccount( accountName );
			await testAccount.authenticate( page );
		} );

		it( 'Navigate to Media', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Media' );
		} );

		it( 'See media gallery', async function () {
			mediaPage = new MediaPage( page );
		} );

		it( 'Upload image and confirm addition to gallery', async function () {
			await mediaPage.upload( testFiles.image.fullpath );
		} );

		it( 'Upload audio and confirm addition to gallery', async function () {
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

		// If we get to here, let's clean up after ourselves.
		// This will minimize test data over time.
		it( 'Delete uploaded media', async function () {
			await mediaPage.deleteSelectedMediaFromLibrary();
		} );
	} );
} );
