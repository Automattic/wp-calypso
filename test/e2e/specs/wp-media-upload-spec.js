/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../lib/flows/login-flow.js';

import EditorPage from '../lib/pages/editor-page.js';
import PostEditorSidebarComponent from '../lib/components/post-editor-sidebar-component.js';

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
		let editorPage;

		before( async function () {
			const loginFlow = new LoginFlow( driver );
			await loginFlow.loginAndStartNewPage();
			editorPage = await EditorPage.Expect( driver );
			await editorPage.displayed();
		} );

		describe( 'Can upload many media types', function () {
			describe( 'Can upload a normal image', function () {
				let fileDetails;

				step( 'Navigate to Editor page and create image file for upload', async function () {
					fileDetails = await mediaHelper.createFileWithFilename( 'normal.jpg' );
				} );

				step( 'Can upload an image', async function () {
					await editorPage.uploadMedia( fileDetails );
				} );

				step( 'Can delete image', async function () {
					await editorPage.deleteMedia();
				} );

				step( 'Clean up', async function () {
					await editorPage.dismissMediaModal();
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
					await editorPage.uploadMedia( fileDetails );
				} );

				step( 'Can delete image', async function () {
					await editorPage.deleteMedia();
				} );

				step( 'Clean up', async function () {
					await editorPage.dismissMediaModal();
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
					await editorPage.uploadMedia( fileDetails );
				} );

				step( 'Can delete mp3', async function () {
					await editorPage.deleteMedia();
				} );

				step( 'Clean up', async function () {
					await editorPage.dismissMediaModal();
					if ( fileDetails ) {
						await mediaHelper.deleteFile( fileDetails );
					}
				} );
			} );

			describe( 'Can upload Featured image', () => {
				let fileDetails;
				let editorSidebar;

				step( 'Create image file for upload', async function () {
					fileDetails = await mediaHelper.createFile();
				} );

				step( 'Can open Featured Image upload modal', async function () {
					editorSidebar = await PostEditorSidebarComponent.Expect( driver );
					await editorSidebar.displayed();
					await editorSidebar.expandFeaturedImage();
					await editorSidebar.openFeaturedImageDialog();
				} );

				step( 'Can set Featured Image', async function () {
					await editorPage.sendFile( fileDetails.file );
					await editorPage.saveImage( fileDetails.imageName );
					// Will wait until image is actually shows up on editor page
					await editorPage.waitUntilFeaturedImageInserted();
				} );

				step( 'Can remove Featured Image', async function () {
					await editorSidebar.removeFeaturedImage();
					await editorSidebar.closeFeaturedImage();
				} );

				step( 'Can delete uploaded image', async function () {
					await editorSidebar.expandFeaturedImage();
					// Opens the media model
					await editorSidebar.openFeaturedImageDialog();
					const mediaPage = new MediaPage( driver );
					await mediaPage.selectFirstImage();
					await editorPage.deleteMedia();
				} );

				step( 'Clean up', async function () {
					await editorPage.dismissMediaModal();
					if ( fileDetails ) {
						await mediaHelper.deleteFile( fileDetails );
					}
					await editorSidebar.closeFeaturedImage();
				} );
			} );
		} );
	} );
} );
