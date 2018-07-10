/**
 * Internal dependencies
 */
import '../support/bootstrap';
import { newPost, newDesktopBrowserPage, pressWithModifier, insertBlock } from '../support/utils';

describe( 'Multi-block selection', () => {
	beforeAll( async () => {
		await newDesktopBrowserPage();
		await newPost();
	} );

	it( 'Should select/unselect multiple blocks', async () => {
		const firstBlockSelector = '[data-type="core/paragraph"]';
		const secondBlockSelector = '[data-type="core/image"]';
		const thirdBlockSelector = '[data-type="core/quote"]';
		const multiSelectedCssClass = 'is-multi-selected';

		// Creating test blocks
		await page.click( '.editor-default-block-appender' );
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
		await pressWithModifier( 'Mod', 'a' );

		// Verify selection
		await expectMultiSelected( blocks, true );

		// Unselect
		await page.keyboard.press( 'Escape' );

		// No selection
		await expectMultiSelected( blocks, false );

		// Select all via double shortcut.
		await page.click( firstBlockSelector );
		await pressWithModifier( 'Mod', 'a' );
		await pressWithModifier( 'Mod', 'a' );
		await expectMultiSelected( blocks, true );
	} );
} );
