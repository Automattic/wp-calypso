/**
 * Internal dependencies
 */
import '../support/bootstrap';
import {
	newPost,
	newDesktopBrowserPage,
	insertBlock,
	getHTMLFromCodeEditor,
	pressTimes,
	pressWithModifier,
} from '../support/utils';

describe( 'splitting and merging blocks', () => {
	beforeAll( async () => {
		await newDesktopBrowserPage();
		await newPost();
	} );

	it( 'Should split and merge paragraph blocks using Enter and Backspace', async () => {
		// Use regular inserter to add paragraph block and text
		await insertBlock( 'Paragraph' );
		await page.keyboard.type( 'FirstSecond' );

		// Move caret between 'First' and 'Second' and press Enter to split
		// paragraph blocks
		await pressTimes( 'ArrowLeft', 6 );
		await page.keyboard.press( 'Enter' );

		// Assert that there are now two paragraph blocks with correct content
		expect( await getHTMLFromCodeEditor() ).toMatchSnapshot();

		// Press Backspace to merge paragraph blocks
		await page.click( '.is-selected' );
		await page.keyboard.press( 'Home' );
		await page.keyboard.press( 'Backspace' );

		// Ensure that caret position is correctly placed at the between point.
		await page.keyboard.type( 'Between' );
		expect( await getHTMLFromCodeEditor() ).toMatchSnapshot();
		// Workaround: When transitioning back from Code to Visual, the caret
		// is placed at the beginning of the selected paragraph. Ideally this
		// should persist selection between modes.
		await pressTimes( 'ArrowRight', 5 ); // After "First"
		await pressTimes( 'Delete', 7 ); // Delete "Between"

		// Edge case: Without ensuring that the editor still has focus when
		// restoring a bookmark, the caret may be inadvertently moved back to
		// an inline boundary after a split occurs.
		await page.keyboard.press( 'Home' );
		await page.keyboard.down( 'Shift' );
		await pressTimes( 'ArrowRight', 5 );
		await page.keyboard.up( 'Shift' );
		await pressWithModifier( 'mod', 'b' );
		// Collapse selection, still within inline boundary.
		await page.keyboard.press( 'ArrowRight' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'BeforeSecond:' );

		expect( await getHTMLFromCodeEditor() ).toMatchSnapshot();
	} );
} );
