/**
 * @jest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
import { dispatch, select } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { render } from '../../test-utils';
import { CheckoutSuccessFlashMessage } from '../checkout-success-flash-message';

function arriveFromCheckout( purchasedPlan: string ) {
	window.history.replaceState(
		{},
		'',
		`/?flash=checkout-success&purchased_plan=${ purchasedPlan }&keep=1`
	);
}

function snackbar( content: string ) {
	return [ expect.objectContaining( { status: 'success', type: 'snackbar', content } ) ];
}

afterEach( () => {
	select( noticesStore )
		.getNotices()
		.forEach( ( notice ) => dispatch( noticesStore ).removeNotice( notice.id ) );
} );

describe( '<CheckoutSuccessFlashMessage>', () => {
	test( 'names the purchased plan and cleans up the URL', async () => {
		arriveFromCheckout( 'business-bundle-monthly' );

		render( <CheckoutSuccessFlashMessage /> );

		await waitFor( () =>
			expect( select( noticesStore ).getNotices() ).toEqual(
				snackbar( "You're in! The Business Plan is now active." )
			)
		);
		expect( window.location.search ).toBe( '?keep=1' );
	} );

	test( 'falls back to the generic message when the slug is not a known plan', async () => {
		// An inherited object key, so a bare lookup would return a function.
		arriveFromCheckout( 'constructor' );

		render( <CheckoutSuccessFlashMessage /> );

		await waitFor( () =>
			expect( select( noticesStore ).getNotices() ).toEqual(
				snackbar( 'Your purchase was completed.' )
			)
		);
	} );
} );
