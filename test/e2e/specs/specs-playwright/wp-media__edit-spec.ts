/**
 * @group calypso-pr
 */

import {
	DataHelper,
	MediaHelper,
	LoginFlow,
	MediaPage,
	SidebarComponent,
	setupHooks,
	TestFile,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';
import { TEST_IMAGE_PATH } from '../constants';

describe( DataHelper.createSuiteTitle( 'Media: Edit Media' ), function () {
	let testImage: TestFile;
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	beforeAll( async () => {
		testImage = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
	} );

	describe.each`
		siteType      | user
		${ 'Simple' } | ${ 'defaultUser' }
		${ 'Atomic' } | ${ 'wooCommerceUser' }
	`( 'Edit Image ($siteType)', function ( { user } ) {
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

		it( 'Show only images', async function () {
			await mediaPage.clickTab( 'Images' );
		} );

		it( 'Upload image', async function () {
			// Ideally, we'd not want to upload an image (that's a separate test)
			// but occasionally, the photo gallery is cleaned out leaving no images.
			const uploadedImageHandle = await mediaPage.upload( testImage.fullpath );
			const isVisible = await uploadedImageHandle.isVisible();
			expect( isVisible ).toBe( true );
		} );

		it( 'Click to edit selected image', async function () {
			await mediaPage.editImage();
		} );

		it( 'Rotate image', async function () {
			await mediaPage.rotateImage();
		} );

		it( 'Cancel image edit', async function () {
			await mediaPage.cancelImageEdit();
		} );
	} );
} );
