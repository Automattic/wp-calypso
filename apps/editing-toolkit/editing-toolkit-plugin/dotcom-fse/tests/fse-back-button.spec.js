/**
 * External dependencies
 */
const { createNewPost } = require( '@wordpress/e2e-test-utils' );

import { activateTheme } from '../../e2e-test-helpers';

describe( 'Full Site Editing Back Button', () => {
	beforeAll( async () => {
		// Otherwise, tests often do not pass quickly enough.
		jest.setTimeout( 10000 );
		await activateTheme( 'maywood' );
		// Creates a new page and uses the blank page layout.
		await createNewPost( { postType: 'page', title: 'New e2e Page!' } );
		await page.click( '.page-template-modal__buttons .components-button.is-primary.is-large' );
	} );

	it( 'Should have an overriden button', async () => {
		// Target the toolbar__override class we added to see if our custom button exists.
		const button = await page.$(
			'.components-toolbar.edit-post-fullscreen-mode-close__toolbar.edit-post-fullscreen-mode-close__toolbar__override'
		);
		// Button is null if it does not exist.
		expect( button ).toBeTruthy();
	} );
} );
