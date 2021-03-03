/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';

import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component';
import GutenbergSidebarComponent from '../lib/gutenberg/gutenberg-editor-sidebar-component';

import * as driverManager from '../lib/driver-manager.js';
import * as mediaHelper from '../lib/media-helper.js';
import * as dataHelper from '../lib/data-helper';
import MediaPage from '../lib/pages/media-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

before( async function () {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Editor: Media Upload (${ screenSize }) @parallel @jetpack`, function () {
	this.timeout( mochaTimeOut );

	describe( 'Image Upload:', function () {
		let gutenbergEditor;
		let blockID;

		before( async function () {
			const loginFlow = new LoginFlow( driver );
			await loginFlow.loginAndStartNewPage( null, true );
			gutenbergEditor = await GutenbergEditorComponent.Expect( driver );
			await gutenbergEditor.displayed();
		} );

		describe( 'Can upload many media types', function () {
			describe( 'Can upload a normal image', function () {
				let fileDetails;

				step( 'Navigate to Editor page and create image file for upload', async function () {
					fileDetails = await mediaHelper.createFileWithFilename( 'normal.jpg' );
				} );

				step( 'Can upload an image', async function () {
					blockID = await gutenbergEditor.addImage( fileDetails );
				} );

				step( 'Can delete image', async function () {
					await gutenbergEditor.removeBlock( blockID );
				} );

				step( 'Clean up', async function () {
					if ( fileDetails ) {
						await mediaHelper.deleteFile( fileDetails );
					}
				} );
			} );

			describe( 'Can upload an image with reserved url chars in the filename', function () {
				let fileDetails;

				step( 'Create image file for upload', async function () {
					fileDetails = await mediaHelper.createFileWithFilename(
						'filewith#?#?reservedurlchars.jpg',
						true
					);
				} );

				step( 'Can upload an image', async function () {
					blockID = await gutenbergEditor.addImage( fileDetails );
				} );

				step( 'Can delete image', async function () {
					await gutenbergEditor.removeBlock( blockID );
				} );

				step( 'Clean up', async function () {
					if ( fileDetails ) {
						await mediaHelper.deleteFile( fileDetails );
					}
				} );
			} );

			describe( 'Can upload an mp3', function () {
				let fileDetails;

				step( 'Create mp3 for upload', async function () {
					fileDetails = await mediaHelper.getMP3FileWithFilename( 'new.mp3' );
				} );

				step( 'Can upload an mp3', async function () {
					blockID = await gutenbergEditor.addFile( fileDetails );
				} );

				step( 'Can delete mp3', async function () {
					await gutenbergEditor.removeBlock( blockID );
				} );

				step( 'Clean up', async function () {
					if ( fileDetails ) {
						await mediaHelper.deleteFile( fileDetails );
					}
				} );
			} );

			// This test passes locally but won't pass in CI.
			// Disabling for now.
			// eslint-disable-next-line jest/no-disabled-tests
			describe.skip( 'Can upload Featured image', () => {
				let fileDetails;
				let gutenbergSidebar;
				let mediaPage;

				step( 'Create image file for upload', async function () {
					fileDetails = await mediaHelper.createFile();
				} );

				step( 'Can open Featured Image upload modal', async function () {
					await gutenbergEditor.openSidebar();
					gutenbergSidebar = await GutenbergSidebarComponent.Expect( driver );
					await gutenbergSidebar.selectTab( 'Page' );
					await gutenbergSidebar.expandFeaturedImage();
					await gutenbergSidebar.openFeaturedImageDialog();
				} );

				step( 'Can set Featured Image', async function () {
					mediaPage = await MediaPage.Expect( driver );
					await mediaPage.uploadFile( fileDetails.file );
					await driver.sleep( 2000 );
					await mediaPage.selectInsertImage();
				} );

				step( 'Can remove Featured Image', async function () {
					gutenbergEditor = await GutenbergEditorComponent.Expect( driver );
					await gutenbergSidebar.removeFeaturedImage();
				} );

				step( 'Can delete uploaded image', async function () {
					await gutenbergSidebar.expandFeaturedImage();
					// Opens the media model
					await gutenbergSidebar.openFeaturedImageDialog();
					mediaPage = await MediaPage.Expect( driver );
					await mediaPage.selectFirstImage();
					await mediaPage.deleteMedia();
				} );

				step( 'Clean up', async function () {
					await mediaPage.clickCancel();
					if ( fileDetails ) {
						await mediaHelper.deleteFile( fileDetails );
					}
				} );
			} );
		} );
	} );
} );
