/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';

/**
 * Internal dependencies
 */
import LoginFlow from '../../lib/flows/login-flow.js';

import GutenbergEditorComponent from '../../lib/gutenberg/gutenberg-editor-component';
import PostPreviewComponent from '../../lib/components/post-preview-component';
import ViewPostPage from '../../lib/pages/view-post-page.js';
import MediaBlockFlows from '../../lib/gutenberg/blocks/shared-block-flows/media-block-flows';

import * as driverManager from '../../lib/driver-manager';
import * as dataHelper from '../../lib/data-helper';
import * as mediaHelper from '../../lib/media-helper';
import * as driverHelper from '../../lib/driver-helper';
import CoverBlockComponent from '../../lib/gutenberg/blocks/cover-block-component.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser =
	process.env.GUTENBERG_EDGE === 'true' ? 'gutenbergSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

describe( `[${ host }] Calypso Gutenberg Editor: Cover Block (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );
	let driver;

	before( 'Start browser', async function () {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
	} );

	describe( 'Full workflow to preview and publish post with Cover @parallel', function () {
		const coverTitleText = 'Witty Cover Text';
		let imageFileDetails;
		let coverBlockId;

		before( async function () {
			imageFileDetails = await mediaHelper.createFile();
		} );

		step( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can add Cover to post', async function () {
			const editorComponent = await GutenbergEditorComponent.Expect( driver );
			coverBlockId = await editorComponent.addBlock( CoverBlockComponent.blockTitle );
		} );

		step( 'Can upload an image to the Cover', async function () {
			const coverComponent = await CoverBlockComponent.Expect( driver, coverBlockId );
			const mediaBlockFlows = new MediaBlockFlows( driver, coverComponent );
			await mediaBlockFlows.uploadImage( imageFileDetails );
			const imageSrcInEditor = await coverComponent.getImageSrc();
			assert(
				imageSrcInEditor.includes( imageFileDetails.fileName ),
				'The uploaded image did not have expected file name in src attribute'
			);
		} );

		step( 'Can add title text to Cover image', async function () {
			const editorComponent = await GutenbergEditorComponent.Expect( driver );
			const coverComponent = await CoverBlockComponent.Expect( driver, coverBlockId );
			await coverComponent.setTitleText( coverTitleText );
			const editorContent = await editorComponent.getContent();
			assert(
				editorContent.includes( coverTitleText ),
				'The typed Cover title text was not found in the editor'
			);
		} );

		step( 'Can see image and title text in preview', async function () {
			const editorComponent = await GutenbergEditorComponent.Expect( driver );
			await editorComponent.ensureSaved();
			await editorComponent.launchPreview();

			const previewComponent = await PostPreviewComponent.Expect( driver );
			const previewContent = await previewComponent.postContent();
			assert(
				previewContent.includes( coverTitleText ),
				'The Cover title text was not found in the preview'
			);
			assert(
				await previewComponent.hasImageWithFileName( imageFileDetails.fileName ),
				'The Cover image was not found in the preview'
			);
		} );

		step( 'Can close post preview', async function () {
			const previewComponent = await PostPreviewComponent.Expect( driver );
			await previewComponent.close();
		} );

		step( 'Can see image and title text in published post', async function () {
			const editorComponent = await GutenbergEditorComponent.Expect( driver );
			await editorComponent.publish( { visit: true } );

			const viewPostPage = await ViewPostPage.Expect( driver );
			const postContent = await viewPostPage.postContent();
			assert(
				postContent.includes( coverTitleText ),
				'The Cover title text was not found in the published post'
			);
			assert(
				viewPostPage.hasImageWithFileName( imageFileDetails.fileName ),
				'The Cover image was not found in the published post'
			);
		} );

		after( async function () {
			if ( imageFileDetails ) {
				await mediaHelper.deleteFile( imageFileDetails );
			}
			await driverHelper.acceptAlertIfPresent( driver );
		} );
	} );
} );
