/**
 * Internal dependencies
 */
import {
	newPost,
	insertBlock,
	getEditedPostContent,
	pressTimes,
} from '../support/utils';

describe( 'adding blocks', () => {
	beforeEach( async () => {
		await newPost();
	} );

	/**
	 * Given a Puppeteer ElementHandle, clicks below its bounding box.
	 *
	 * @param {Puppeteer.ElementHandle} elementHandle Element handle.
	 *
	 * @return {Promise} Promise resolving when click occurs.
	 */
	async function clickBelow( elementHandle ) {
		const box = await elementHandle.boundingBox();
		const x = box.x + ( box.width / 2 );
		const y = box.y + box.height + 100;
		return page.mouse.click( x, y );
	}

	it( 'Should insert content using the placeholder and the regular inserter', async () => {
		// Click below editor to focus last field (block appender)
		await clickBelow( await page.$( '.editor-default-block-appender' ) );
		expect( await page.$( '[data-type="core/paragraph"]' ) ).not.toBeNull();
		await page.keyboard.type( 'Paragraph block' );

		// Using the slash command
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( '/quote' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'Quote block' );

		// Arrow down into default appender.
		await page.keyboard.press( 'ArrowDown' );
		await page.keyboard.press( 'ArrowDown' );

		// Focus should be moved to block focus boundary on a block which does
		// not have its own inputs (e.g. image). Proceeding to press enter will
		// append the default block. Pressing backspace on the focused block
		// will remove it.
		await page.keyboard.type( '/image' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.press( 'Enter' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
		await page.keyboard.press( 'Backspace' );
		await page.keyboard.press( 'Backspace' );
		expect( await getEditedPostContent() ).toMatchSnapshot();

		// Using the regular inserter
		await insertBlock( 'Preformatted' );
		await page.keyboard.type( 'Pre block' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.press( 'Enter' );

		// Verify vertical traversal at offset. This has been buggy in the past
		// where verticality on a blank newline would skip into previous block.
		await page.keyboard.type( 'Foo' );
		await page.keyboard.press( 'ArrowUp' );
		await page.keyboard.press( 'ArrowUp' );
		await pressTimes( 'ArrowRight', 3 );
		await pressTimes( 'Delete', 6 );
		await page.keyboard.type( ' text' );

		// Ensure newline preservation in shortcode block.
		// See: https://github.com/WordPress/gutenberg/issues/4456
		await insertBlock( 'Shortcode' );
		await page.keyboard.type( '[myshortcode]With multiple' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'lines preserved[/myshortcode]' );

		// Unselect blocks to avoid conflicts with the inbetween inserter
		await page.click( '.editor-post-title__input' );

		// Using the between inserter
		const insertionPoint = await page.$( '[data-type="core/quote"] .editor-inserter__toggle' );
		const rect = await insertionPoint.boundingBox();
		await page.mouse.move( rect.x + ( rect.width / 2 ), rect.y + ( rect.height / 2 ), { steps: 10 } );
		await page.waitForSelector( '[data-type="core/quote"] .editor-inserter__toggle' );
		await page.click( '[data-type="core/quote"] .editor-inserter__toggle' );
		// [TODO]: Search input should be focused immediately. It shouldn't be
		// necessary to have `waitForFunction`.
		await page.waitForFunction( () => (
			document.activeElement &&
			document.activeElement.classList.contains( 'editor-inserter__search' )
		) );
		await page.keyboard.type( 'para' );
		await pressTimes( 'Tab', 3 );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'Second paragraph' );

		// Switch to Text Mode to check HTML Output
		await page.click( '.edit-post-more-menu [aria-label="Show more tools & options"]' );
		const codeEditorButton = ( await page.$x( "//button[contains(text(), 'Code Editor')]" ) )[ 0 ];
		await codeEditorButton.click( 'button' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	// Check for regression of https://github.com/WordPress/gutenberg/issues/9583
	it( 'should not allow transfer of focus outside of the block-insertion menu once open', async () => {
		// Enter the default block and click the inserter toggle button to the left of it.
		await page.keyboard.press( 'ArrowDown' );
		await page.click( '.editor-block-list__empty-block-inserter .editor-inserter__toggle' );

		// Expect the inserter search input to be the active element.
		let activeElementClassList = await page.evaluate( () => document.activeElement.classList );
		expect( Object.values( activeElementClassList ) ).toContain( 'editor-inserter__search' );

		// Try using the up arrow key (vertical navigation triggers the issue described in #9583).
		await page.keyboard.press( 'ArrowUp' );

		// Expect the inserter search input to still be the active element.
		activeElementClassList = await page.evaluate( () => document.activeElement.classList );
		expect( Object.values( activeElementClassList ) ).toContain( 'editor-inserter__search' );

		// Tab to the block search results
		await page.keyboard.press( 'Tab' );

		// Expect the search results to be the active element.
		activeElementClassList = await page.evaluate( () => document.activeElement.classList );
		expect( Object.values( activeElementClassList ) ).toContain( 'editor-inserter__results' );

		// Try using the up arrow key
		await page.keyboard.press( 'ArrowUp' );

		// Expect the search results to still be the active element.
		activeElementClassList = await page.evaluate( () => document.activeElement.classList );
		expect( Object.values( activeElementClassList ) ).toContain( 'editor-inserter__results' );

		// Press escape to close the block inserter.
		await page.keyboard.press( 'Escape' );

		// Expect focus to have transferred back to the inserter toggle button.
		activeElementClassList = await page.evaluate( () => document.activeElement.classList );
		expect( Object.values( activeElementClassList ) ).toContain( 'editor-inserter__toggle' );
	} );
} );
