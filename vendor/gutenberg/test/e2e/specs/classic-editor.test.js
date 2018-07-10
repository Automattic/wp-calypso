/**
 * Internal dependencies
 */
import '../support/bootstrap';
import { visitAdmin, newDesktopBrowserPage } from '../support/utils';

describe( 'classic editor', () => {
	beforeAll( async () => {
		await newDesktopBrowserPage();
		await visitAdmin( 'post-new.php', 'classic-editor' );
	} );

	it( 'Should work properly', async () => {
		// Click visual editor
		await page.click( '#content-tmce' );
		await page.click( '#content_ifr' );

		// type some random text
		await page.keyboard.type( 'Typing in classic editor' );

		// Switch to HTML mode
		await page.click( '#content-html' );

		const textEditorContent = await page.$eval( '.wp-editor-area', ( element ) => element.value );
		expect( textEditorContent ).toEqual( 'Typing in classic editor' );
	} );
} );
