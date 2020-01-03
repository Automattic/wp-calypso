/**
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { createRegistry, createPayPalMethod } from '@automattic/composite-checkout';
import {
	mockSetCartEndpoint,
	mockGetCartEndpointWith,
	mockPayPalExpressRequest,
} from '@automattic/composite-checkout-wpcom';

/**
 * Internal dependencies
 */
import { CompositeCheckout } from '../composite-checkout';

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

const noop = () => {};

test( 'When we enter checkout, the line items and total are rendered', async () => {
	const initialCart = {
		coupon: '',
		currency: 'BRL',
		locale: 'br-pt',
		is_coupon_applied: false,
		products: [
			{
				product_name: '.cash Domain',
				product_slug: 'domain',
				currency: 'BRL',
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
				item_subtotal_integer: 500,
				item_subtotal_display: 'R$5',
			},
			{
				product_name: 'WordPress.com Personal',
				product_slug: 'personal_bundle',
				currency: 'BRL',
				extra: {
					context: 'signup',
					domain_to_bundle: 'foo.cash',
				},
				free_trial: false,
				meta: '',
				product_id: 1009,
				volume: 1,
				item_subtotal_integer: 14400,
				item_subtotal_display: 'R$144',
			},
		],
		tax: {
			display_taxes: false,
			location: {},
		},
		temporary: false,
		allowed_payment_methods: [ 'WPCOM_Billing_Stripe_Payment_Method' ],
		total_tax_integer: 700,
		total_tax_display: 'R$7',
		total_cost_integer: 15600,
		total_cost_display: 'R$156',
	};

	const registry = createRegistry();
	const { registerStore } = registry;
	const store = createStore( () => ( {
		plans: { items: [] },
	} ) );

	const MyCheckout = () => (
		<Provider store={ store }>
			<CompositeCheckout
				siteSlug={ 'foo.com' }
				setCart={ mockSetCartEndpoint }
				getCart={ mockGetCartEndpointWith( initialCart ) }
				availablePaymentMethods={ [
					createPayPalMethod( {
						registerStore: registerStore,
						submitTransaction: mockPayPalExpressRequest,
					} ),
				] }
				registry={ registry }
				onPaymentComplete={ noop }
				showErrorMessage={ noop }
				showInfoMessage={ noop }
				showSuccessMessage={ noop }
			/>
		</Provider>
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
		.map( element => expect( element ).toHaveTextContent( 'R$7' ) );

	// All elements labeled 'Total' show the expected price
	renderResult
		.getAllByLabelText( 'Total' )
		.map( element => expect( element ).toHaveTextContent( 'R$156' ) );
} );
