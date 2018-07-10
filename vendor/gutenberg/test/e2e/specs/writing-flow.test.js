/**
 * Internal dependencies
 */
import '../support/bootstrap';
import {
	newPost,
	newDesktopBrowserPage,
	getHTMLFromCodeEditor,
	pressWithModifier,
	pressTimes,
} from '../support/utils';

describe( 'adding blocks', () => {
	beforeEach( async () => {
		await newDesktopBrowserPage();
		await newPost();
	} );

	it( 'Should navigate inner blocks with arrow keys', async () => {
		let activeElementText;

		// Add demo content
		await page.click( '.editor-default-block-appender__content' );
		await page.keyboard.type( 'First paragraph' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( '/columns' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'First column paragraph' );

		// Arrow down should navigate through layouts in columns block (to
		// its default appender). Two key presses are required since the first
		// will land user on the Column wrapper block.
		await page.keyboard.press( 'ArrowDown' );
		await page.keyboard.press( 'ArrowDown' );
		await page.keyboard.type( 'Second column paragraph' );

		// Arrow down from last of layouts exits nested context to default
		// appender of root level.
		await page.keyboard.press( 'ArrowDown' );
		await page.keyboard.type( 'Second paragraph' );

		// Arrow up into nested context focuses last text input
		await page.keyboard.press( 'ArrowUp' );
		activeElementText = await page.evaluate( () => document.activeElement.textContent );
		expect( activeElementText ).toBe( 'Second column paragraph' );

		// Arrow up in inner blocks should navigate through (1) column wrapper,
		// (2) text fields.
		await page.keyboard.press( 'ArrowUp' );
		await page.keyboard.press( 'ArrowUp' );
		activeElementText = await page.evaluate( () => document.activeElement.textContent );
		expect( activeElementText ).toBe( 'First column paragraph' );

		// Arrow up from first text field in nested context focuses column and
		// columns wrappers before escaping out.
		let activeElementBlockType;
		await page.keyboard.press( 'ArrowUp' );
		activeElementBlockType = await page.evaluate( () => (
			document.activeElement.getAttribute( 'data-type' )
		) );
		expect( activeElementBlockType ).toBe( 'core/column' );
		await page.keyboard.press( 'ArrowUp' );
		activeElementBlockType = await page.evaluate( () => (
			document.activeElement.getAttribute( 'data-type' )
		) );
		expect( activeElementBlockType ).toBe( 'core/columns' );

		// Arrow up from focused (columns) block wrapper exits nested context
		// to prior text input.
		await page.keyboard.press( 'ArrowUp' );
		activeElementText = await page.evaluate( () => document.activeElement.textContent );
		expect( activeElementText ).toBe( 'First paragraph' );

		expect( await getHTMLFromCodeEditor() ).toMatchSnapshot();
	} );

	it( 'should navigate around inline boundaries', async () => {
		// Add demo content
		await page.click( '.editor-default-block-appender__content' );
		await page.keyboard.type( 'First' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'Second' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'Third' );

		// Navigate to second paragraph
		await pressTimes( 'ArrowLeft', 6 );

		// Bold second paragraph text
		await page.keyboard.down( 'Shift' );
		await pressTimes( 'ArrowLeft', 6 );
		await page.keyboard.up( 'Shift' );
		await pressWithModifier( 'mod', 'b' );

		// Arrow left from selected bold should collapse to before the inline
		// boundary. Arrow once more to traverse into first paragraph.
		//
		// See native behavior example: http://fiddle.tinymce.com/kvgaab
		//
		//  1. Select all of second paragraph, end to beginning
		//  2. Press ArrowLeft
		//  3. Type
		//  4. Note that text is not bolded
		//
		// This is technically different than how other word processors treat
		// the collapse while a bolded segment is selected, but our behavior
		// is consistent with TinyMCE.
		await page.keyboard.press( 'ArrowLeft' );
		await page.keyboard.press( 'ArrowLeft' );
		await page.keyboard.type( 'After' );

		// Arrow right from end of first should traverse to second, *BEFORE*
		// the bolded text. Another press should move within inline boundary.
		await pressTimes( 'ArrowRight', 2 );
		await page.keyboard.type( 'Inside' );

		// Arrow left from end of beginning of inline boundary should move to
		// the outside of the inline boundary.
		await pressTimes( 'ArrowLeft', 6 );
		await page.keyboard.press( 'ArrowLeft' ); // Separate for emphasis.
		await page.keyboard.type( 'Before' );

		// Likewise, test at the end of the inline boundary for same effect.
		await page.keyboard.press( 'ArrowRight' ); // Move inside
		await pressTimes( 'ArrowRight', 12 );
		await page.keyboard.type( 'Inside' );
		await page.keyboard.press( 'ArrowRight' );

		// Edge case: Verify that workaround to test for ZWSP at beginning of
		// focus node does not take effect when on the right edge of inline
		// boundary (thus preventing traversing to the next block by arrow).
		await page.keyboard.press( 'ArrowRight' );
		await page.keyboard.press( 'ArrowLeft' );

		// Should be after the inline boundary again.
		await page.keyboard.type( 'After' );

		// Finally, ensure that ArrowRight from end of unbolded text moves to
		// the last paragraph
		await page.keyboard.press( 'ArrowRight' );
		await page.keyboard.type( 'Before' );

		expect( await getHTMLFromCodeEditor() ).toMatchSnapshot();
	} );
} );
