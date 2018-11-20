/**
 * Internal dependencies
 */
import {
	newPost,
	getEditedPostContent,
	insertBlock,
	clickBlockAppender,
	pressWithModifier,
	META_KEY,
	ACCESS_MODIFIER_KEYS,
} from '../support/utils';

describe( 'RichText', () => {
	beforeEach( async () => {
		await newPost();
	} );

	it( 'should handle change in tag name gracefully', async () => {
		// Regression test: The heading block changes the tag name of its
		// RichText element. Historically this has been prone to breakage,
		// specifically in destroying / reinitializing the TinyMCE instance.
		//
		// See: https://github.com/WordPress/gutenberg/issues/3091
		await insertBlock( 'Heading' );
		await page.click( '[aria-label="Heading 3"]' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should apply formatting with access shortcut', async () => {
		await clickBlockAppender();
		await page.keyboard.type( 'test' );
		await pressWithModifier( META_KEY, 'a' );
		await pressWithModifier( ACCESS_MODIFIER_KEYS, 'd' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should apply formatting with primary shortcut', async () => {
		await clickBlockAppender();
		await page.keyboard.type( 'test' );
		await pressWithModifier( META_KEY, 'a' );
		await pressWithModifier( META_KEY, 'b' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should apply formatting when selection is collapsed', async () => {
		await clickBlockAppender();
		await page.keyboard.type( 'Some ' );
		// All following characters should now be bold.
		await pressWithModifier( META_KEY, 'b' );
		await page.keyboard.type( 'bold' );
		// All following characters should no longer be bold.
		await pressWithModifier( META_KEY, 'b' );
		await page.keyboard.type( '.' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );
} );
