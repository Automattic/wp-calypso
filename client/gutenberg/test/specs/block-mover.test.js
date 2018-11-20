/**
 * Internal dependencies
 */
import { newPost } from '../support/utils';

describe( 'block mover', () => {
	beforeEach( async () => {
		await newPost();
	} );

	it( 'should show block mover when more than one block exists', async () => {
		// Create a two blocks on the page.
		await page.click( '.editor-default-block-appender' );
		await page.keyboard.type( 'First Paragraph' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'Second Paragraph' );

		// Select a block so the block mover is rendered.
		await page.focus( '.editor-block-list__block' );

		const blockMover = await page.$$( '.editor-block-mover' );
		// There should be a block mover.
		expect( blockMover ).toHaveLength( 1 );
	} );

	it( 'should hide block mover when only one block exists', async () => {
		// Create a single block on the page.
		await page.click( '.editor-default-block-appender' );
		await page.keyboard.type( 'First Paragraph' );

		// Select a block so the block mover has the possibility of being rendered.
		await page.focus( '.editor-block-list__block' );

		// Ensure no block mover exists when only one block exists on the page.
		const blockMover = await page.$$( '.editor-block-mover' );
		expect( blockMover ).toHaveLength( 0 );
	} );
} );
