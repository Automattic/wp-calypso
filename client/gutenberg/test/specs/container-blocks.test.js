/**
 * Internal dependencies
 */
import {
	newPost,
	insertBlock,
	switchToEditor,
	getEditedPostContent,
} from '../support/utils';
import { activatePlugin, deactivatePlugin } from '../support/plugins';

describe( 'InnerBlocks Template Sync', () => {
	beforeAll( async () => {
		await activatePlugin( 'gutenberg-test-innerblocks-templates' );
	} );

	beforeEach( async () => {
		await newPost();
	} );

	afterAll( async () => {
		await deactivatePlugin( 'gutenberg-test-innerblocks-templates' );
	} );

	const insertBlockAndAddParagraphInside = async ( blockName, blockSlug ) => {
		const paragraphToAdd = `
			<!-- wp:paragraph -->
			<p>added paragraph</p>
			<!-- /wp:paragraph -->
		`;
		await insertBlock( blockName );
		await switchToEditor( 'Code' );
		await page.$eval( '.editor-post-text-editor', ( element, _paragraph, _blockSlug ) => {
			const blockDelimiter = `<!-- /wp:${ _blockSlug } -->`;
			element.value = element.value.replace( blockDelimiter, `${ _paragraph }${ blockDelimiter }` );
		}, paragraphToAdd, blockSlug );
		// Press "Enter" inside the Code Editor to fire the `onChange` event for the new value.
		await page.click( '.editor-post-text-editor' );
		await page.keyboard.press( 'Enter' );
		await switchToEditor( 'Visual' );
	};

	it( 'Ensures blocks without locking are kept intact even if they do not match the template ', async () => {
		await insertBlockAndAddParagraphInside( 'Test Inner Blocks no locking', 'test/test-inner-blocks-no-locking' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'Removes blocks that are not expected by the template if a lock all exists ', async () => {
		await insertBlockAndAddParagraphInside( 'Test InnerBlocks locking all', 'test/test-inner-blocks-locking-all' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );
} );

describe( 'Container block without paragraph support', () => {
	beforeAll( async () => {
		await activatePlugin( 'gutenberg-test-container-block-without-paragraph' );
	} );

	beforeEach( async () => {
		await newPost();
	} );

	afterAll( async () => {
		await deactivatePlugin( 'gutenberg-test-container-block-without-paragraph' );
	} );

	it( 'ensures we can use the alternative block appender properly', async () => {
		await insertBlock( 'Container without paragraph' );

		// Open the specific appender used when there's no paragraph support.
		await page.click( '.editor-inner-blocks .block-list-appender .block-list-appender__toggle' );

		// Insert an image block.
		await page.click( '.editor-inserter__results button[aria-label="Image"]' );

		// Check the inserted content.
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );
} );
