/**
 * @group calypso-pr
 * @group jetpack
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

describe( DataHelper.createSuiteTitle( 'Media: Edit Media' ), function () {
	let testImage: TestFile;
	let page: Page;
	let mediaPage: MediaPage;
	const accountName = getTestAccountByFeature( envToFeatureKey( envVariables ), [
		{
			gutenberg: 'stable',
			siteType: 'simple',
			accountName: 'simpleSitePersonalPlanUser',
		},
	] );

	beforeAll( async () => {
		testImage = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
		page = await browser.newPage();
		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	it( 'Navigate to Media', async function () {
		const sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.navigate( 'Media' );
		mediaPage = new MediaPage( page );
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
		await mediaPage.deleteImageFromModal();
	} );
} );
