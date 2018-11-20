/**
 * Internal dependencies
 */
import { visitAdmin } from '../support/utils';

describe( 'classic editor', () => {
	beforeAll( async () => {
		await visitAdmin( 'post-new.php', 'classic-editor' );
	} );

	it( 'Should work properly', async () => {
		// Click visual editor
		await expect( page ).toClick( '#content-tmce' );
		await expect( page ).toClick( '#content_ifr' );

		// type some random text
		await page.keyboard.type( 'Typing in classic editor' );

		// Switch to HTML mode
		await expect( page ).toClick( '#content-html' );

		const textEditorContent = await page.$eval( '.wp-editor-area', ( element ) => element.value );
		expect( textEditorContent ).toEqual( 'Typing in classic editor' );
	} );
} );
