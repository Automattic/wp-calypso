/**
 * @group calypso-pr
 */

import {
	DataHelper,
	MediaHelper,
	LoginPage,
	MediaPage,
	SidebarComponent,
	TestFile,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';
import { setupHooks } from '../../lib/jest/setup-hooks';
import { TEST_IMAGE_PATH } from '../constants';

describe( DataHelper.createSuiteTitle( 'Media: Edit Media' ), function () {
	let testImage: TestFile;
	let page: Page;

	setupHooks( ( createdPage ) => {
		page = createdPage;
	} );

	beforeAll( async () => {
		testImage = await MediaHelper.createTestFile( TEST_IMAGE_PATH );
	} );

	describe.each`
		siteType      | user
		${ 'Atomic' } | ${ 'eCommerceUser' }
	`( 'Edit Image ($siteType)', function ( { user } ) {
		let mediaPage: MediaPage;

		it( 'Log in', async function () {
			const loginPage = new LoginPage( page );
			await loginPage.login( { account: user } );
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
	} );
} );
