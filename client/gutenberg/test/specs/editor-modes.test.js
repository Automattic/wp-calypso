/**
 * Internal dependencies
 */
import { clickBlockAppender, newPost, switchToEditor } from '../support/utils';

describe( 'Editing modes (visual/HTML)', () => {
	beforeEach( async () => {
		await newPost();
		await clickBlockAppender();
		await page.keyboard.type( 'Hello world!' );
	} );

	it( 'should switch between visual and HTML modes', async () => {
		// This block should be in "visual" mode by default.
		let visualBlock = await page.$$( '.editor-block-list__layout .editor-block-list__block .editor-rich-text' );
		expect( visualBlock ).toHaveLength( 1 );

		// Move the mouse to show the block toolbar
		await page.mouse.move( 200, 300, { steps: 10 } );

		// Change editing mode from "Visual" to "HTML".
		await page.waitForSelector( 'button[aria-label="More options"]' );
		await page.click( 'button[aria-label="More options"]' );
		let changeModeButton = await page.waitForXPath( '//button[text()="Edit as HTML"]' );
		await changeModeButton.click();

		// Wait for the block to be converted to HTML editing mode.
		const htmlBlock = await page.$$( '.editor-block-list__layout .editor-block-list__block .editor-block-list__block-html-textarea' );
		expect( htmlBlock ).toHaveLength( 1 );

		// Move the mouse to show the block toolbar
		await page.mouse.move( 200, 300, { steps: 10 } );

		// Change editing mode from "HTML" back to "Visual".
		await page.waitForSelector( 'button[aria-label="More options"]' );
		await page.click( 'button[aria-label="More options"]' );
		changeModeButton = await page.waitForXPath( '//button[text()="Edit visually"]' );
		await changeModeButton.click();

		// This block should be in "visual" mode by default.
		visualBlock = await page.$$( '.editor-block-list__layout .editor-block-list__block .editor-rich-text' );
		expect( visualBlock ).toHaveLength( 1 );
	} );

	it( 'should display sidebar in HTML mode', async () => {
		// Move the mouse to show the block toolbar
		await page.mouse.move( 200, 300, { steps: 10 } );

		// Change editing mode from "Visual" to "HTML".
		await page.waitForSelector( 'button[aria-label="More options"]' );
		await page.click( 'button[aria-label="More options"]' );
		const changeModeButton = await page.waitForXPath( '//button[text()="Edit as HTML"]' );
		await changeModeButton.click();

		// The font size picker for the paragraph block should appear, even in
		// HTML editing mode.
		const fontSizePicker = await page.$$( '.edit-post-sidebar .components-font-size-picker__buttons' );
		expect( fontSizePicker ).toHaveLength( 1 );
	} );

	it( 'should update HTML in HTML mode when sidebar is used', async () => {
		// Move the mouse to show the block toolbar
		await page.mouse.move( 200, 300, { steps: 10 } );

		// Change editing mode from "Visual" to "HTML".
		await page.waitForSelector( 'button[aria-label="More options"]' );
		await page.click( 'button[aria-label="More options"]' );
		const changeModeButton = await page.waitForXPath( '//button[text()="Edit as HTML"]' );
		await changeModeButton.click();

		// Make sure the paragraph content is rendered as expected.
		let htmlBlockContent = await page.$eval( '.editor-block-list__layout .editor-block-list__block .editor-block-list__block-html-textarea', ( node ) => node.textContent );
		expect( htmlBlockContent ).toEqual( '<p>Hello world!</p>' );

		// Change the font size using the sidebar.
		await page.click( '.components-font-size-picker__selector' );
		const changeSizeButton = await page.waitForSelector( '.components-button.is-font-large' );
		await changeSizeButton.click();

		// Make sure the HTML content updated.
		htmlBlockContent = await page.$eval( '.editor-block-list__layout .editor-block-list__block .editor-block-list__block-html-textarea', ( node ) => node.textContent );
		expect( htmlBlockContent ).toEqual( '<p class="has-large-font-size">Hello world!</p>' );
	} );

	it( 'the code editor should unselect blocks and disable the inserter', async () => {
		// The paragraph block should be selected
		const title = await page.$eval(
			'.editor-block-inspector__card-title',
			( element ) => element.innerText
		);
		expect( title ).toBe( 'Paragraph' );

		// The Block inspector should be active
		let blockInspectorTab = await page.$( '.edit-post-sidebar__panel-tab.is-active[data-label="Block"]' );
		expect( blockInspectorTab ).not.toBeNull();

		// Switch to Code Editor
		await switchToEditor( 'Code' );

		// The Block inspector should not be active anymore
		blockInspectorTab = await page.$( '.edit-post-sidebar__panel-tab.is-active[data-label="Block"]' );
		expect( blockInspectorTab ).toBeNull();

		// No block is selected
		await page.click( '.edit-post-sidebar__panel-tab[data-label="Block"]' );
		const noBlocksElement = await page.$( '.editor-block-inspector__no-blocks' );
		expect( noBlocksElement ).not.toBeNull();

		// The inserter is disabled
		const disabledInserter = await page.$( '.editor-inserter > button:disabled' );
		expect( disabledInserter ).not.toBeNull();
	} );
} );
