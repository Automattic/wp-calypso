/**
 * @group calypso-pr
 * @group jetpack-remote-site
 * @group jetpack-wpcom-integration
 */

import {
	DataHelper,
	MediaHelper,
	MediaPage,
	SidebarComponent,
	TestFile,
	TestAccount,
	getTestAccountByFeature,
	envToFeatureKey,
	envVariables,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { TEST_IMAGE_PATH } from '../constants';

declare const browser: Browser;

/**
 * Ensures image media can be uploaded then edited in the gallery.
 *
 * Keywords: Media, Image, Gallery, Upload
 */
describe( DataHelper.createSuiteTitle( 'Media: Edit Media' ), function () {
	let page: Page;
	let mediaPage: MediaPage;
	let testAccount: TestAccount;
	let testImage: TestFile;

	const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ) );

	beforeAll( async () => {
		testImage = await MediaHelper.createTestFile( TEST_IMAGE_PATH );

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

	it( 'Upload image', async function () {
		// Ideally, we'd not want to upload an image (that's a separate test)
		// but occasionally, the photo gallery is cleaned out leaving no images.
		await mediaPage.upload( testImage.fullpath );
	} );

	it( 'Launch image editor', async function () {
		await mediaPage.editSelectedItem();
		await mediaPage.launchImageEditor();
	} );

	it( 'Rotate image', async function () {
		await mediaPage.rotateImage();
	} );

	it( 'Cancel image edit', async function () {
		await mediaPage.cancelImageEdit();
	} );

	// For the majority of cases where we get to this point, let's just clean up the image here.
	// This makes this test more re-usable across target platforms (like Pressable).
	it( 'Delete image', async function () {
		await mediaPage.deleteMediaFromModal();
	} );
} );
