/**
 * Internal dependencies
 */
import { newPost } from '../support/utils';

describe( 'preferences', () => {
	beforeAll( async () => {
		await newPost();
	} );

	/**
	 * Returns a promise which resolves to the text content of the active
	 * editor sidebar tab, or null if there is no active sidebar tab (closed).
	 *
	 * @return {Promise} Promise resolving to active tab.
	 */
	async function getActiveSidebarTabText() {
		try {
			return await page.$eval(
				'.edit-post-sidebar__panel-tab.is-active',
				( node ) => node.textContent
			);
		} catch ( error ) {
			// page.$eval throws when it does not find the selector, which we
			// can intentionally intercept and consider as there being no
			// active sidebar tab (no sidebar).
			return null;
		}
	}

	it( 'remembers sidebar dismissal between sessions', async () => {
		// Open by default.
		expect( await getActiveSidebarTabText() ).toBe( 'Document' );

		// Change to "Block" tab.
		await page.click( '.edit-post-sidebar__panel-tab[aria-label="Block settings"]' );
		expect( await getActiveSidebarTabText() ).toBe( 'Block' );

		// Regression test: Reload resets to document tab.
		//
		// See: https://github.com/WordPress/gutenberg/issues/6377
		// See: https://github.com/WordPress/gutenberg/pull/8995
		await page.reload();
		expect( await getActiveSidebarTabText() ).toBe( 'Document' );

		// Dismiss
		await page.click( '.edit-post-sidebar__panel-tabs [aria-label="Close settings"]' );
		expect( await getActiveSidebarTabText() ).toBe( null );

		// Remember after reload.
		await page.reload();
		expect( await getActiveSidebarTabText() ).toBe( null );
	} );
} );
