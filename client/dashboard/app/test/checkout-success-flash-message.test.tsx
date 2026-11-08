/**
 * @jest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
import { dispatch, select } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { render } from '../../test-utils';
import { CheckoutSuccessFlashMessage } from '../checkout-success-flash-message';

afterEach( () => {
	dispatch( noticesStore ).removeAllNotices( 'snackbar' );
} );

test( 'names the plan bought, then removes `flash` and `purchased_plan`', async () => {
	window.history.replaceState(
		null,
		'',
		'/sites?flash=checkout-success&purchased_plan=business-bundle&page=2'
	);
	render( <CheckoutSuccessFlashMessage /> );

	await waitFor( () => expect( window.location.search ).toBe( '?page=2' ) );
	expect(
		select( noticesStore )
			.getNotices()
			.map( ( { content } ) => content )
	).toEqual( [ "You're in! The Business Plan is now active." ] );
} );
