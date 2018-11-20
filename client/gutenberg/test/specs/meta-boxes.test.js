/**
 * Internal dependencies
 */
import { newPost, insertBlock, publishPost } from '../support/utils';
import { activatePlugin, deactivatePlugin } from '../support/plugins';

describe( 'Meta boxes', () => {
	beforeAll( async () => {
		await activatePlugin( 'gutenberg-test-plugin-meta-box' );
		await newPost();
	} );

	afterAll( async () => {
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

	it( 'Should render dynamic blocks when the meta box uses the excerpt for front end rendering', async () => {
		// Publish a post so there's something for the latest posts dynamic block to render.
		await newPost();
		await page.type( '.editor-post-title__input', 'A published post' );
		await insertBlock( 'Paragraph' );
		await page.keyboard.type( 'Hello there!' );
		await publishPost();

		// Publish a post with the latest posts dynamic block.
		await newPost();
		await page.type( '.editor-post-title__input', 'Dynamic block test' );
		await insertBlock( 'Latest Posts' );
		await publishPost();

		// View the post.
		const viewPostLinks = await page.$x( "//a[contains(text(), 'View Post')]" );
		await viewPostLinks[ 0 ].click();
		await page.waitForNavigation();

		// Check the the dynamic block appears.
		await page.waitForSelector( '.wp-block-latest-posts' );
	} );
} );
