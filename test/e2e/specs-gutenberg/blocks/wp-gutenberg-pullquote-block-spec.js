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
import PullquoteBlockComponent from '../../lib/gutenberg/blocks/pullquote-block-component';
import PostPreviewComponent from '../../lib/components/post-preview-component';
import ViewPostPage from '../../lib/pages/view-post-page.js';

import * as driverManager from '../../lib/driver-manager';
import * as dataHelper from '../../lib/data-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const gutenbergUser =
	process.env.GUTENBERG_EDGE === 'true' ? 'gutenbergSimpleSiteEdgeUser' : 'gutenbergSimpleSiteUser';

describe( `[${ host }] Calypso Gutenberg Editor: Pullquote Block (${ screenSize })`, function () {
	this.timeout( mochaTimeOut );
	let driver;

	before( 'Start browser', async function () {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
	} );

	describe( 'Full workflow to preview and publish post with Pullquote @parallel', function () {
		let pullquoteBlockId;

		const quoteText =
			'The problem with quotes on the Internet is that it is hard to verify their authenticity.';
		const citationText = 'Abraham Lincoln';

		step( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can add pullquote to post', async function () {
			const editorComponent = await GutenbergEditorComponent.Expect( driver );
			pullquoteBlockId = await editorComponent.addBlock( PullquoteBlockComponent.blockTitle );
		} );

		step( 'Can add quote text to pullquote', async function () {
			const editorComponent = await GutenbergEditorComponent.Expect( driver );
			const pullquoteComponent = await PullquoteBlockComponent.Expect( driver, pullquoteBlockId );
			await pullquoteComponent.setQuote( quoteText );
			const editorContent = await editorComponent.getContent();
			assert(
				editorContent.includes( quoteText ),
				'The typed quote text was not found in the editor'
			);
		} );

		step( 'Can add citation text to pullquote', async function () {
			const editorComponent = await GutenbergEditorComponent.Expect( driver );
			const pullquoteComponent = await PullquoteBlockComponent.Expect( driver, pullquoteBlockId );
			await pullquoteComponent.setCitation( citationText );
			const editorContent = await editorComponent.getContent();
			assert(
				editorContent.includes( citationText ),
				'The typed citation text was not found in the editor'
			);
		} );

		step( 'Can see quote and citation in preview', async function () {
			const editorComponent = await GutenbergEditorComponent.Expect( driver );
			await editorComponent.ensureSaved();
			await editorComponent.launchPreview();

			const previewComponent = await PostPreviewComponent.Expect( driver );
			const previewContent = await previewComponent.postContent();
			assert( previewContent.includes( quoteText ), 'The quote text was not found in the preview' );
			assert(
				previewContent.includes( citationText ),
				'The citation text was not found in the preview'
			);
		} );

		step( 'Can close post preview', async function () {
			const previewComponent = await PostPreviewComponent.Expect( driver );
			await previewComponent.close();
		} );

		step( 'Can see quote and citation in published post', async function () {
			const editorComponent = await GutenbergEditorComponent.Expect( driver );
			await editorComponent.publish( { visit: true } );

			const viewPostPage = await ViewPostPage.Expect( driver );
			const postContent = await viewPostPage.postContent();
			assert(
				postContent.includes( quoteText ),
				'The quote text was not found in the published post'
			);
			assert(
				postContent.includes( citationText ),
				'The citation text was not found in the published post'
			);
		} );
	} );
} );
