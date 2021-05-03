/**
 * External dependencies
 */
import assert from 'assert';
import config from 'config';
import { By, Key } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import LoginFlow from '../../lib/flows/login-flow.js';

import GutenbergEditorComponent from '../../lib/gutenberg/gutenberg-editor-component';
import GutenbergBlockToolbarComponent from '../../lib/gutenberg/gutenberg-block-toolbar-component';
import PostPreviewComponent from '../../lib/components/post-preview-component';
import ViewPostPage from '../../lib/pages/view-post-page.js';
import { PullquoteBlockComponent } from '../../lib/gutenberg/blocks';

import * as driverManager from '../../lib/driver-manager';
import * as dataHelper from '../../lib/data-helper';
import * as driverHelper from '../../lib/driver-helper';

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

	describe( 'Block transforms to and from Pullquote', function () {
		// This block ID will persist across transforms and be re-used in the block element each time
		let blockId;
		const quoteText = 'Dude, I never said half the things that people attribute to my name.';
		const citationText = 'Mark Twain';

		step( 'Can log in', async function () {
			this.loginFlow = new LoginFlow( driver, gutenbergUser );
			await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can add text to Paragraph', async function () {
			const editorComponent = await GutenbergEditorComponent.Expect( driver );
			await editorComponent.enterText( quoteText );
		} );

		step( 'Can transform Paragraph to Pullquote', async function () {
			const paragraphBlock = await driver.findElement(
				By.css( `p[aria-label='Paragraph block']` )
			);
			blockId = await paragraphBlock.getAttribute( 'id' );

			// Getting the toolbar to show up after typing text is surprisingly difficult!
			// The simplest, stablest method is to tab the cursor out, then refocus the block.
			const actions = driver.actions();
			await actions.keyDown( Key.TAB ).keyUp( Key.TAB ).perform();
			await driverHelper.clickWhenClickable( driver, By.css( `#${ blockId }` ) );

			const blockToolbarComponent = await GutenbergBlockToolbarComponent.Expect( driver );
			await blockToolbarComponent.transformBlockToNewType( 'pullquote' );

			// we can't just look at block ID, because it actually stays the same between transforms!
			// so specifically, we want to make sure a Paragraph block with that ID does not exist anymore
			await driverHelper.waitTillNotPresent(
				driver,
				By.css( `p#${ blockId }.wp-block-paragraph` )
			);
		} );

		step( 'Transformed Pullquote has the text as its quote text', async function () {
			const pullquoteBlockComponent = await PullquoteBlockComponent.Expect( driver, blockId );
			assert(
				( await pullquoteBlockComponent.getQuoteText() ).includes( quoteText ),
				'Text from Paragraph did not end up as Pullquote quote text'
			);
		} );

		step( 'Can add citation to new transformed Pullquote', async function () {
			const pullquoteBlockComponent = await PullquoteBlockComponent.Expect( driver, blockId );
			await pullquoteBlockComponent.setCitation( citationText );
		} );

		step( 'Can transform the Pullquote back into Paragraph block(s)', async function () {
			const pullquoteBlockComponent = await PullquoteBlockComponent.Expect( driver, blockId );

			// Just like above, having just entered text here can block the toolbar from appearing.
			// Using the same sequence of events to clear cursor and refocus the block.
			const actions = driver.actions();
			await actions.keyDown( Key.TAB ).keyUp( Key.TAB ).perform();
			await pullquoteBlockComponent.focusBlock();

			const blockToolbarComponent = await GutenbergBlockToolbarComponent.Expect( driver );
			await blockToolbarComponent.transformBlockToNewType( 'paragraph' );

			// once again, the block ID will persist!
			// so we must be granular and look for a Pullquote specifically to disappear
			await driverHelper.waitTillNotPresent( driver, By.css( `${ blockId }.wp-block-pullquote` ) );
		} );

		step( 'Both the quote and citation text are kept across transform', async function () {
			const editorComponent = await GutenbergEditorComponent.Expect( driver );
			const editorContent = await editorComponent.getContent();
			assert(
				editorContent.includes( quoteText ),
				'Quote text could not be found after transform to Paragraph'
			);
			assert(
				editorContent.includes( citationText ),
				'Citation text could not be found after transform to Paragraph'
			);
		} );
	} );
} );
