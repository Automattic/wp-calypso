/**
 * @group calypso-pr
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

/**
 * Ensures various types of media can be uploaded to the gallery.
 *
 * If any steps begin to fail permanently, check the following:
 * 	- test user has the approprite plan on production store;
 * 	- check with MarTech that plan details have not changed.
 *
 * Keywords: Media, Image, Video, Audio, Gallery, Upload
 */
describe( DataHelper.createSuiteTitle( 'Media: Upload' ), () => {
	let page: Page;
	let mediaPage: MediaPage;
	let testAccount: TestAccount;
	let testFiles: { image: TestFile; audio: TestFile; unsupported: TestFile };

	const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );

	beforeAll( async () => {
		testFiles = {
			image: await MediaHelper.createTestFile( TEST_IMAGE_PATH ),
			audio: await MediaHelper.createTestFile( TEST_AUDIO_PATH ),
			unsupported: await MediaHelper.createTestFile( TEST_UNSUPPORTED_FILE_PATH ),
		};

		page = await browser.newPage();

		testAccount = new TestAccount( accountName );
		if ( accountName === 'jetpackAtomicEcommPlanUser' ) {
			// Switching to or logging into eCommerce plan sites inevitably
			// loads WP-Admin instead of Calypso, but the rediret occurs
			// only after Calypso attempts to load.
			await testAccount.authenticate( page, { url: /wp-admin/ } );
		} else {
			await testAccount.authenticate( page );
		}

		mediaPage = new MediaPage( page );
	} );

	it( 'Navigate to Media', async function () {
		// eCommerce plan loads WP-Admin for home dashboard,
		// so instead navigate straight to the Media page.
		if ( envVariables.ATOMIC_VARIATION === 'ecomm-plan' ) {
			await mediaPage.visit( testAccount.credentials.testSites?.primary.url as string );
		} else {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Media' );
		}
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
