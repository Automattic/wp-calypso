/**
 * Internal dependencies
 */
import { newPost } from '../support/utils';

describe( 'popovers', () => {
	beforeEach( async () => {
		await newPost();
	} );

	describe( 'dropdown', () => {
		it( 'toggles via click', async () => {
			const isMoreMenuOpen = async () => !! await page.$( '.edit-post-more-menu__content' );

			expect( await isMoreMenuOpen() ).toBe( false );

			// Toggle opened.
			await page.click( '.edit-post-more-menu > button' );
			expect( await isMoreMenuOpen() ).toBe( true );

			// Toggle closed.
			await page.click( '.edit-post-more-menu > button' );
			expect( await isMoreMenuOpen() ).toBe( false );
		} );
	} );
} );
