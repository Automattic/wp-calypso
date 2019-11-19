/**
 * Need to force the test environment to be browser-like.
 *
 * @see https://github.com/Automattic/wp-calypso/blob/master/docs/testing/unit-tests.md#testing-globals
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { createRegistry, createPayPalMethod } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import {
	WPCOMCheckout,
	makeShoppingCartHook,
	mockCartEndpoint,
	mockPayPalExpressRequest,
} from '../src/index';

let container = null;

beforeEach( () => {
	// setup a DOM element as a render target
	container = document.createElement( 'div' );
	document.body.appendChild( container );
} );

afterEach( () => {
	// cleanup on exiting
	unmountComponentAtNode( container );
	container.remove();
	container = null;
} );

test( 'When we enter checkout, the line items and total are rendered', async () => {
	const initialCart = {
		coupon: '',
		currency: 'BRL',
		is_coupon_applied: false,
		products: [
			{
				extra: {
					context: 'signup',
					domain_registration_agreement_url:
						'https://wordpress.com/automattic-domain-name-registration-agreement/',
					privacy: true,
					privacy_available: true,
					registrar: 'KS_RAM',
				},
				free_trial: false,
				meta: 'foo.cash',
				product_id: 106,
				volume: 1,
			},
			{
				extra: {
					context: 'signup',
					domain_to_bundle: 'foo.cash',
				},
				free_trial: false,
				meta: '',
				product_id: 1009,
				volume: 1,
			},
		],
		tax: {
			display_taxes: false,
			location: {},
		},
		temporary: false,
	};

	const registry = createRegistry();
	const { registerStore } = registry;

	// Using a mocked server responses
	const useShoppingCart = makeShoppingCartHook( mockCartEndpoint, initialCart );

	const MyCheckout = () => (
		<WPCOMCheckout
			useShoppingCart={ useShoppingCart }
			availablePaymentMethods={ [
				createPayPalMethod( {
					registerStore: registerStore,
					makePayPalExpressRequest: mockPayPalExpressRequest,
				} ),
			] }
			registry={ registry }
		/>
	);

	let renderResult;

	await act( async () => {
		renderResult = render( <MyCheckout />, container );
	} );

	// Product line items show the correct price
	renderResult
		.getAllByLabelText( 'WordPress.com Personal' )
		.map( element => expect( element ).toHaveTextContent( 'R$144' ) );

	// Tax line items show the expected amount
	renderResult
		.getAllByLabelText( 'Tax' )
		.map( element => expect( element ).toHaveTextContent( 'R$5' ) );

	// All elements labeled 'Total' show the expected price
	renderResult
		.getAllByLabelText( 'Total' )
		.map( element => expect( element ).toHaveTextContent( 'R$149' ) );
} );
