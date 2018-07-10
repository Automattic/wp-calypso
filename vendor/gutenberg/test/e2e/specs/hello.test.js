/**
 * Internal dependencies
 */
import '../support/bootstrap';
import { newPost, newDesktopBrowserPage } from '../support/utils';

describe( 'hello', () => {
	beforeAll( async () => {
		await newDesktopBrowserPage();
		await newPost();
	} );

	it( 'Should show the New Post Page in Gutenberg', async () => {
		expect( page.url() ).toEqual( expect.stringContaining( 'post-new.php' ) );
		// Should display the title.
		const title = await page.$( '[placeholder="Add title"]' );
		expect( title ).not.toBeNull();
		// Should display the Preview button.
		const postPreviewButton = await page.$( '.editor-post-preview.components-button' );
		expect( postPreviewButton ).not.toBeNull();
		// Should display the Post Formats UI.
		const postFormatsUi = await page.$( '.editor-post-format' );
		expect( postFormatsUi ).not.toBeNull();
	} );

	it( 'Should have no history', async () => {
		const undoButton = await page.$( '.editor-history__undo:not( :disabled )' );
		const redoButton = await page.$( '.editor-history__redo:not( :disabled )' );

		expect( undoButton ).toBeNull();
		expect( redoButton ).toBeNull();
	} );
} );
