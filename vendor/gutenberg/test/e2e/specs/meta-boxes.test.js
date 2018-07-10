/**
 * Internal dependencies
 */
import '../support/bootstrap';
import { newPost, newDesktopBrowserPage } from '../support/utils';
import { activatePlugin, deactivatePlugin } from '../support/plugins';

describe( 'Meta boxes', () => {
	beforeAll( async () => {
		await newDesktopBrowserPage();
		await activatePlugin( 'gutenberg-test-plugin-meta-box' );
		await newPost();
	} );

	afterAll( async () => {
		await newDesktopBrowserPage();
		await deactivatePlugin( 'gutenberg-test-plugin-meta-box' );
	} );

	it( 'Should save the post', async () => {
		// Save should not be an option for new empty post.
		expect( await page.$( '.editor-post-save-draft' ) ).toBe( null );

		// Add title to enable valid non-empty post save.
		await page.type( '.editor-post-title__input', 'Hello Meta' );
		expect( await page.$( '.editor-post-save-draft' ) ).not.toBe( null );

		await Promise.all( [
			// Transitions between three states "Saving..." -> "Saved" -> "Save
			// Draft" (the button is always visible while meta are present).
			page.waitForSelector( '.editor-post-saved-state.is-saving' ),
			page.waitForSelector( '.editor-post-saved-state.is-saved' ),
			page.waitForSelector( '.editor-post-save-draft' ),

			// Keyboard shortcut Ctrl+S save.
			page.keyboard.down( 'Meta' ),
			page.keyboard.press( 'S' ),
			page.keyboard.up( 'Meta' ),
		] );
	} );
} );
