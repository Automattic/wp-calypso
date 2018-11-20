/**
 * Internal dependencies
 */
import {
	newPost,
	insertBlock,
	getEditedPostContent,
	pressTimes,
	pressWithModifier,
	META_KEY,
} from '../support/utils';

describe( 'splitting and merging blocks', () => {
	beforeEach( async () => {
		await newPost();
	} );

	it( 'should split and merge paragraph blocks using Enter and Backspace', async () => {
		// Use regular inserter to add paragraph block and text
		await insertBlock( 'Paragraph' );
		await page.keyboard.type( 'FirstSecond' );

		// Move caret between 'First' and 'Second' and press Enter to split
		// paragraph blocks
		await pressTimes( 'ArrowLeft', 6 );
		await page.keyboard.press( 'Enter' );

		// Assert that there are now two paragraph blocks with correct content
		expect( await getEditedPostContent() ).toMatchSnapshot();

		// Press Backspace to merge paragraph blocks
		await page.keyboard.press( 'Backspace' );

		// Ensure that caret position is correctly placed at the between point.
		await page.keyboard.type( 'Between' );
		expect( await getEditedPostContent() ).toMatchSnapshot();

		await pressTimes( 'Backspace', 7 ); // Delete "Between"

		// Edge case: Without ensuring that the editor still has focus when
		// restoring a bookmark, the caret may be inadvertently moved back to
		// an inline boundary after a split occurs.
		await page.keyboard.press( 'Home' );
		await page.keyboard.down( 'Shift' );
		await pressTimes( 'ArrowRight', 5 );
		await page.keyboard.up( 'Shift' );
		await pressWithModifier( META_KEY, 'b' );
		// Collapse selection, still within inline boundary.
		await page.keyboard.press( 'ArrowRight' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'BeforeSecond:' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should merge into inline boundary position', async () => {
		// Regression Test: Caret should reset to end of inline boundary when
		// backspacing to delete second paragraph.
		await insertBlock( 'Paragraph' );
		await pressWithModifier( META_KEY, 'b' );
		await page.keyboard.type( 'Foo' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.press( 'Backspace' );

		// Replace contents of first paragraph with "Bar".
		await pressTimes( 'Backspace', 4 );
		await page.keyboard.type( 'Bar' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should delete an empty first line', async () => {
		// Regression Test: When a paragraph block has line break, and the first
		// line has no text, pressing backspace at the start of the second line
		// should remove the first.
		//
		// See: https://github.com/WordPress/gutenberg/issues/8388

		// First paragraph
		await insertBlock( 'Paragraph' );
		await page.keyboard.type( 'First' );
		await page.keyboard.press( 'Enter' );

		// Second paragraph
		await page.keyboard.down( 'Shift' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.up( 'Shift' );

		// Delete the soft line break.
		await page.keyboard.press( 'Backspace' );

		// Typing at this point should occur still within the second paragraph,
		// while before the regression fix it would have occurred in the first.
		await page.keyboard.type( 'Still Second' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should not merge paragraphs if the selection is not collapsed', async () => {
		// Regression Test: When all of a paragraph is selected, pressing
		// backspace should delete the contents, not merge to previous.
		//
		// See: https://github.com/WordPress/gutenberg/issues/8268
		await insertBlock( 'Paragraph' );
		await page.keyboard.type( 'Foo' );
		await insertBlock( 'Paragraph' );
		await page.keyboard.type( 'Bar' );

		// Select text.
		await page.keyboard.down( 'Shift' );
		await pressTimes( 'ArrowLeft', 3 );
		await page.keyboard.up( 'Shift' );

		// Delete selection.
		await page.keyboard.press( 'Backspace' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should gracefully handle if placing caret in empty container', async () => {
		// Regression Test: placeCaretAtHorizontalEdge previously did not
		// account for contentEditables which have no children.
		//
		// See: https://github.com/WordPress/gutenberg/issues/8676
		await insertBlock( 'Paragraph' );
		await page.keyboard.type( 'Foo' );

		// The regression appeared to only affect paragraphs created while
		// within an inline boundary.
		await page.keyboard.down( 'Shift' );
		await pressTimes( 'ArrowLeft', 3 );
		await page.keyboard.up( 'Shift' );
		await pressWithModifier( META_KEY, 'b' );
		await page.keyboard.press( 'ArrowRight' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.press( 'Enter' );

		await page.keyboard.press( 'Backspace' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should forward delete from an empty paragraph', async () => {
		// Regression test: Bogus nodes in a TinyMCE container can interfere
		// with isHorizontalEdge detection, preventing forward deletion.
		//
		// See: https://github.com/WordPress/gutenberg/issues/8731
		await insertBlock( 'Paragraph' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'Second' );
		await page.keyboard.press( 'ArrowUp' );
		await page.keyboard.press( 'Delete' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should remove empty paragraph block on backspace', async () => {
		// Regression Test: In a sole empty paragraph, pressing backspace
		// should remove the block.
		//
		// See: https://github.com/WordPress/gutenberg/pull/8306
		await insertBlock( 'Paragraph' );
		await page.keyboard.press( 'Backspace' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should remove at most one paragraph in forward direction', async () => {
		// Regression Test: A forward delete on empty RichText previously would
		// destroy two paragraphs on the dual-action of merge & remove.
		//
		// See: https://github.com/WordPress/gutenberg/pull/8735
		await insertBlock( 'Paragraph' );
		await page.keyboard.type( 'First' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'Second' );
		await page.keyboard.press( 'ArrowUp' );
		await page.keyboard.press( 'ArrowUp' );
		await page.keyboard.press( 'Delete' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should ensure always a default block', async () => {
		// Feature: To avoid focus loss, removal of all blocks will result in a
		// default block insertion at the root. Pressing backspace in a new
		// paragraph should not effectively allow removal. This is counteracted
		// with pre-save content processing to save post consisting of only the
		// unmodified default block as an empty string.
		//
		// See: https://github.com/WordPress/gutenberg/issues/9626
		await insertBlock( 'Paragraph' );
		await page.keyboard.press( 'Backspace' );

		// There is a default block:
		expect( await page.$$( '.editor-block-list__block' ) ).toHaveLength( 1 );

		// But the effective saved content is still empty:
		expect( await getEditedPostContent() ).toBe( '' );

		// And focus is retained:
		const isInDefaultBlock = await page.evaluate( () => {
			const activeBlockName = document.activeElement
				.closest( '[data-type]' )
				.getAttribute( 'data-type' );
			const defaultBlockName = window.wp.blocks.getDefaultBlockName();

			return activeBlockName === defaultBlockName;
		} );

		expect( isInDefaultBlock ).toBe( true );
	} );
} );
