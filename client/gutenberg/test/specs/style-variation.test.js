/**
 * Internal dependencies
 */
import { newPost, insertBlock, getEditedPostContent } from '../support/utils';

describe( 'adding blocks', () => {
	beforeAll( async () => {
		await newPost();
	} );

	it( 'Should switch the style of the quote block', async () => {
		// Inserting a quote block
		await insertBlock( 'Quote' );
		await page.keyboard.type( 'Quote content' );

		// we need to trigger isTyping = false
		await page.mouse.move( 200, 300, { steps: 10 } );
		await page.mouse.move( 250, 350, { steps: 10 } );

		// Use a different style variation
		await page.waitForSelector( 'button[aria-label="Change block type"]' );
		await page.click( 'button[aria-label="Change block type"]' );
		const styleVariations = await page.$$( '.editor-block-styles__item' );
		await styleVariations[ 1 ].click();

		// Check the content
		const content = await getEditedPostContent();
		expect( content ).toMatchSnapshot();
	} );
} );
