/**
 * Internal dependencies
 */
import {
	insertBlock,
	newPost,
	pressWithModifier,
	searchForBlock,
	getEditedPostContent,
	META_KEY,
} from '../support/utils';

function waitForAndAcceptDialog() {
	return new Promise( ( resolve ) => {
		page.once( 'dialog', () => resolve() );
	} );
}

describe( 'Reusable Blocks', () => {
	beforeAll( async () => {
		await newPost();
	} );

	beforeEach( async () => {
		// Remove all blocks from the post so that we're working with a clean slate
		await page.evaluate( () => {
			const blocks = wp.data.select( 'core/editor' ).getBlocks();
			const clientIds = blocks.map( ( block ) => block.clientId );
			wp.data.dispatch( 'core/editor' ).removeBlocks( clientIds );
		} );
	} );

	it( 'can be created', async () => {
		// Insert a paragraph block
		await insertBlock( 'Paragraph' );
		await page.keyboard.type( 'Hello there!' );

		// Trigger isTyping = false
		await page.mouse.move( 200, 300, { steps: 10 } );
		await page.mouse.move( 250, 350, { steps: 10 } );

		// Convert block to a reusable block
		await page.waitForSelector( 'button[aria-label="More options"]' );
		await page.click( 'button[aria-label="More options"]' );
		const convertButton = await page.waitForXPath( '//button[text()="Add to Reusable Blocks"]' );
		await convertButton.click();

		// Wait for creation to finish
		await page.waitForXPath(
			'//*[contains(@class, "components-notice") and contains(@class, "is-success")]/*[text()="Block created."]'
		);

		// Select all of the text in the title field by triple-clicking on it. We
		// triple-click because, on Mac, Mod+A doesn't work. This step can be removed
		// when https://github.com/WordPress/gutenberg/issues/7972 is fixed
		await page.click( '.reusable-block-edit-panel__title', { clickCount: 3 } );

		// Give the reusable block a title
		await page.keyboard.type( 'Greeting block' );

		// Save the reusable block
		const [ saveButton ] = await page.$x( '//button[text()="Save"]' );
		await saveButton.click();

		// Wait for saving to finish
		await page.waitForXPath( '//button[text()="Edit"]' );

		// Check that we have a reusable block on the page
		const block = await page.$( '.editor-block-list__block[data-type="core/block"]' );
		expect( block ).not.toBeNull();

		// Check that its title is displayed
		const title = await page.$eval(
			'.reusable-block-edit-panel__info',
			( element ) => element.innerText
		);
		expect( title ).toBe( 'Greeting block' );
	} );

	it( 'can be created with no title', async () => {
		// Insert a paragraph block
		await insertBlock( 'Paragraph' );
		await page.keyboard.type( 'Hello there!' );

		// Trigger isTyping = false
		await page.mouse.move( 200, 300, { steps: 10 } );
		await page.mouse.move( 250, 350, { steps: 10 } );

		// Convert block to a reusable block
		await page.waitForSelector( 'button[aria-label="More options"]' );
		await page.click( 'button[aria-label="More options"]' );
		const convertButton = await page.waitForXPath( '//button[text()="Add to Reusable Blocks"]' );
		await convertButton.click();

		// Wait for creation to finish
		await page.waitForXPath(
			'//*[contains(@class, "components-notice") and contains(@class, "is-success")]/*[text()="Block created."]'
		);

		// Save the reusable block
		const [ saveButton ] = await page.$x( '//button[text()="Save"]' );
		await saveButton.click();

		// Wait for saving to finish
		await page.waitForXPath( '//button[text()="Edit"]' );

		// Check that we have a reusable block on the page
		const block = await page.$( '.editor-block-list__block[data-type="core/block"]' );
		expect( block ).not.toBeNull();

		// Check that it is untitled
		const title = await page.$eval(
			'.reusable-block-edit-panel__info',
			( element ) => element.innerText
		);
		expect( title ).toBe( 'Untitled Reusable Block' );
	} );

	it( 'can be inserted and edited', async () => {
		// Insert the reusable block we created above
		await insertBlock( 'Greeting block' );

		// Put the reusable block in edit mode
		const [ editButton ] = await page.$x( '//button[text()="Edit"]' );
		await editButton.click();

		// Change the block's title
		await page.keyboard.type( 'Surprised greeting block' );

		// Tab three times to navigate to the block's content
		await page.keyboard.press( 'Tab' );
		await page.keyboard.press( 'Tab' );

		// Change the block's content
		await page.keyboard.type( 'Oh! ' );

		// Save the reusable block
		const [ saveButton ] = await page.$x( '//button[text()="Save"]' );
		await saveButton.click();

		// Wait for saving to finish
		await page.waitForXPath( '//button[text()="Edit"]' );

		// Check that we have a reusable block on the page
		const block = await page.$( '.editor-block-list__block[data-type="core/block"]' );
		expect( block ).not.toBeNull();

		// Check that its title is displayed
		const title = await page.$eval(
			'.reusable-block-edit-panel__info',
			( element ) => element.innerText
		);
		expect( title ).toBe( 'Surprised greeting block' );

		// Check that its content is up to date
		const text = await page.$eval(
			'.editor-block-list__block[data-type="core/block"] .editor-rich-text',
			( element ) => element.innerText
		);
		expect( text ).toMatch( 'Oh! Hello there!' );
	} );

	it( 'can be converted to a regular block', async () => {
		// Insert the reusable block we edited above
		await insertBlock( 'Surprised greeting block' );

		// Convert block to a regular block
		await page.click( 'button[aria-label="More options"]' );
		const convertButton = await page.waitForXPath(
			'//button[text()="Convert to Regular Block"]'
		);
		await convertButton.click();

		// Check that we have a paragraph block on the page
		const block = await page.$( '.editor-block-list__block[data-type="core/paragraph"]' );
		expect( block ).not.toBeNull();

		// Check that its content is up to date
		const text = await page.$eval(
			'.editor-block-list__block[data-type="core/paragraph"] .editor-rich-text',
			( element ) => element.innerText
		);
		expect( text ).toMatch( 'Oh! Hello there!' );
	} );

	it( 'can be deleted', async () => {
		// Insert the reusable block we edited above
		await insertBlock( 'Surprised greeting block' );

		// Delete the block and accept the confirmation dialog
		await page.click( 'button[aria-label="More options"]' );
		const convertButton = await page.waitForXPath( '//button[text()="Remove from Reusable Blocks"]' );
		await Promise.all( [ waitForAndAcceptDialog(), convertButton.click() ] );

		// Check that we have an empty post again
		expect( await getEditedPostContent() ).toBe( '' );

		// Search for the block in the inserter
		await searchForBlock( 'Surprised greeting block' );

		// Check that we couldn't find it
		const items = await page.$$(
			'.editor-block-types-list__item[aria-label="Surprised greeting block"]'
		);
		expect( items ).toHaveLength( 0 );
	} );

	it( 'can be created from multiselection', async () => {
		await newPost();

		// Insert a Two paragraphs block
		await insertBlock( 'Paragraph' );
		await page.keyboard.type( 'Hello there!' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'Second paragraph' );

		// Select all the blocks
		await pressWithModifier( META_KEY, 'a' );
		await pressWithModifier( META_KEY, 'a' );

		// Trigger isTyping = false
		await page.mouse.move( 200, 300, { steps: 10 } );
		await page.mouse.move( 250, 350, { steps: 10 } );

		// Convert block to a reusable block
		await page.waitForSelector( 'button[aria-label="More options"]' );
		await page.click( 'button[aria-label="More options"]' );
		const convertButton = await page.waitForXPath( '//button[text()="Add to Reusable Blocks"]' );
		await convertButton.click();

		// Wait for creation to finish
		await page.waitForXPath(
			'//*[contains(@class, "components-notice") and contains(@class, "is-success")]/*[text()="Block created."]'
		);

		// Select all of the text in the title field by triple-clicking on it. We
		// triple-click because, on Mac, Mod+A doesn't work. This step can be removed
		// when https://github.com/WordPress/gutenberg/issues/7972 is fixed
		await page.click( '.reusable-block-edit-panel__title', { clickCount: 3 } );

		// Give the reusable block a title
		await page.keyboard.type( 'Multi-selection reusable block' );

		// Save the reusable block
		const [ saveButton ] = await page.$x( '//button[text()="Save"]' );
		await saveButton.click();

		// Wait for saving to finish
		await page.waitForXPath( '//button[text()="Edit"]' );

		// Check that we have a reusable block on the page
		const block = await page.$( '.editor-block-list__block[data-type="core/block"]' );
		expect( block ).not.toBeNull();

		// Check that its title is displayed
		const title = await page.$eval(
			'.reusable-block-edit-panel__info',
			( element ) => element.innerText
		);
		expect( title ).toBe( 'Multi-selection reusable block' );
	} );

	it( 'multi-selection reusable block can be converted back to regular blocks', async () => {
		// Insert the reusable block we edited above
		await insertBlock( 'Multi-selection reusable block' );

		// Convert block to a regular block
		await page.click( 'button[aria-label="More options"]' );
		const convertButton = await page.waitForXPath(
			'//button[text()="Convert to Regular Block"]'
		);
		await convertButton.click();

		// Check that we have two paragraph blocks on the page
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );
} );
