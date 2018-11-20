/**
 * Internal dependencies
 */
import {
	clickBlockAppender,
	insertBlock,
	newPost,
	pressWithModifier,
	META_KEY,
} from '../support/utils';

describe( 'Multi-block selection', () => {
	beforeEach( async () => {
		await newPost();
	} );

	it( 'Should select/unselect multiple blocks', async () => {
		const firstBlockSelector = '[data-type="core/paragraph"]';
		const secondBlockSelector = '[data-type="core/image"]';
		const thirdBlockSelector = '[data-type="core/quote"]';
		const multiSelectedCssClass = 'is-multi-selected';

		// Creating test blocks
		await clickBlockAppender();
		await page.keyboard.type( 'First Paragraph' );
		await insertBlock( 'Image' );
		await insertBlock( 'Quote' );
		await page.keyboard.type( 'Quote Block' );

		const blocks = [ firstBlockSelector, secondBlockSelector, thirdBlockSelector ];
		const expectMultiSelected = async ( selectors, areMultiSelected ) => {
			for ( const selector of selectors ) {
				const className = await page.$eval( selector, ( element ) => element.className );
				if ( areMultiSelected ) {
					expect( className ).toEqual( expect.stringContaining( multiSelectedCssClass ) );
				} else {
					expect( className ).not.toEqual( expect.stringContaining( multiSelectedCssClass ) );
				}
			}
		};

		// Default: No selection
		await expectMultiSelected( blocks, false );

		// Multiselect via Shift + click
		await page.mouse.move( 200, 300 );
		await page.click( firstBlockSelector );
		await page.keyboard.down( 'Shift' );
		await page.click( thirdBlockSelector );
		await page.keyboard.up( 'Shift' );

		// Verify selection
		await expectMultiSelected( blocks, true );

		// Unselect
		await page.click( secondBlockSelector );

		// No selection
		await expectMultiSelected( blocks, false );

		// Multiselect via keyboard
		await page.click( 'body' );
		await pressWithModifier( META_KEY, 'a' );

		// Verify selection
		await expectMultiSelected( blocks, true );

		// Unselect
		await page.keyboard.press( 'Escape' );

		// No selection
		await expectMultiSelected( blocks, false );

		// Select all via double shortcut.
		await page.click( firstBlockSelector );
		await pressWithModifier( META_KEY, 'a' );
		await pressWithModifier( META_KEY, 'a' );
		await expectMultiSelected( blocks, true );
	} );

	it( 'Should select/unselect multiple blocks using Shift + Arrows', async () => {
		const firstBlockSelector = '[data-type="core/paragraph"]';
		const secondBlockSelector = '[data-type="core/image"]';
		const thirdBlockSelector = '[data-type="core/quote"]';
		const multiSelectedCssClass = 'is-multi-selected';

		// Creating test blocks
		await clickBlockAppender();
		await page.keyboard.type( 'First Paragraph' );
		await insertBlock( 'Image' );
		await insertBlock( 'Quote' );
		await page.keyboard.type( 'Quote Block' );

		const blocks = [ firstBlockSelector, secondBlockSelector, thirdBlockSelector ];
		const expectMultiSelected = async ( selectors, areMultiSelected ) => {
			for ( const selector of selectors ) {
				const className = await page.$eval( selector, ( element ) => element.className );
				if ( areMultiSelected ) {
					expect( className ).toEqual( expect.stringContaining( multiSelectedCssClass ) );
				} else {
					expect( className ).not.toEqual( expect.stringContaining( multiSelectedCssClass ) );
				}
			}
		};

		// Default: No selection
		await expectMultiSelected( blocks, false );

		// Multiselect via Shift + click
		await page.mouse.move( 200, 300 );
		await page.click( firstBlockSelector );
		await page.keyboard.down( 'Shift' );
		await page.keyboard.press( 'ArrowDown' ); // Two blocks selected
		await page.keyboard.press( 'ArrowDown' ); // Three blocks selected
		await page.keyboard.up( 'Shift' );

		// Verify selection
		await expectMultiSelected( blocks, true );
	} );

	it( 'should speak() number of blocks selected with multi-block selection', async () => {
		await clickBlockAppender();
		await page.keyboard.type( 'First Paragraph' );
		await insertBlock( 'Paragraph' );
		await page.keyboard.type( 'Second Paragraph' );
		await insertBlock( 'Paragraph' );
		await page.keyboard.type( 'Third Paragraph' );

		// Multiselect via keyboard.
		await pressWithModifier( META_KEY, 'a' );
		await pressWithModifier( META_KEY, 'a' );

		// TODO: It would be great to do this test by spying on `wp.a11y.speak`,
		// but it's very difficult to do that because `wp.a11y` has
		// DOM-dependant side-effect setup code and doesn't seem straightforward
		// to mock. Instead, we check for the DOM node that `wp.a11y.speak()`
		// inserts text into.
		const speakTextContent = await page.$eval( '#a11y-speak-assertive', ( element ) => element.textContent );
		expect( speakTextContent.trim() ).toEqual( '3 blocks selected.' );
	} );
} );
