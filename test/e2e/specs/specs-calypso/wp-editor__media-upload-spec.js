/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../../lib/flows/login-flow.js';

import GutenbergEditorComponent from '../../lib/gutenberg/gutenberg-editor-component';

import * as driverManager from '../../lib/driver-manager.js';
import * as mediaHelper from '../../lib/media-helper.js';
import * as dataHelper from '../../lib/data-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Editor: Media Upload (${ screenSize }) @parallel @jetpack`, function () {
	this.timeout( mochaTimeOut );
	let gutenbergEditor;
	let blockID;

	before( async function () {
		let editorType = 'iframe';
		const loginFlow = new LoginFlow( this.driver );

		if ( host !== 'WPCOM' ) {
			editorType = 'wpadmin';
		}
		await loginFlow.loginAndStartNewPage( null, true, { editorType: editorType } );

		gutenbergEditor = await GutenbergEditorComponent.Expect( this.driver, editorType );
		await gutenbergEditor.displayed();
	} );

	describe( 'Can upload a normal image', function () {
		let fileDetails;

		it( 'Navigate to Editor page and create image file for upload', async function () {
			fileDetails = await mediaHelper.createFileWithFilename( 'normal.jpg' );
		} );

		it( 'Can upload an image', async function () {
			blockID = await gutenbergEditor.addImage( fileDetails );
		} );

		it( 'Can delete image', async function () {
			await gutenbergEditor.removeBlock( blockID );
		} );

		it( 'Clean up', async function () {
			if ( fileDetails ) {
				await mediaHelper.deleteFile( fileDetails );
			}
		} );
	} );

	describe( 'Can upload an image with reserved url chars in the filename', function () {
		let fileDetails;

		it( 'Create image file for upload', async function () {
			fileDetails = await mediaHelper.createFileWithFilename(
				'filewith#?#?reservedurlchars.jpg',
				true
			);
		} );

		it( 'Can upload an image', async function () {
			blockID = await gutenbergEditor.addImage( fileDetails );
		} );

		it( 'Can delete image', async function () {
			await gutenbergEditor.removeBlock( blockID );
		} );

		it( 'Clean up', async function () {
			if ( fileDetails ) {
				await mediaHelper.deleteFile( fileDetails );
			}
		} );
	} );

	describe( 'Can upload an mp3', function () {
		let fileDetails;

		it( 'Create mp3 for upload', async function () {
			fileDetails = await mediaHelper.getMP3FileWithFilename( 'new.mp3' );
		} );

		it( 'Can upload an mp3', async function () {
			blockID = await gutenbergEditor.addFile( fileDetails );
		} );

		it( 'Can delete mp3', async function () {
			await gutenbergEditor.removeBlock( blockID );
		} );

		it( 'Clean up', async function () {
			if ( fileDetails ) {
				await mediaHelper.deleteFile( fileDetails );
			}
		} );
	} );
} );
