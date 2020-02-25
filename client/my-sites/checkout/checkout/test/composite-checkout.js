/**
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import React from 'react';
import { act } from 'react-dom/test-utils';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider as ReduxProvider } from 'react-redux';
import '@testing-library/jest-dom/extend-expect'; // eslint-disable-line import/no-extraneous-dependencies
import { mockSetCartEndpoint, mockGetCartEndpointWith } from '@automattic/composite-checkout-wpcom';
import { render } from '@testing-library/react'; // eslint-disable-line import/no-extraneous-dependencies

/**
 * Internal dependencies
 */
import CompositeCheckout from '../composite-checkout';
import { StripeHookProvider } from 'lib/stripe';

const fetchStripeConfiguration = async () => {
	return {
		public_key: 'abc123',
		js_url: 'https://js.stripe.com/v3/',
	};
};

describe( 'CompositeCheckout', () => {
	let container;
	let MyCheckout;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );

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
				display_taxes: true,
				location: {},
			},
			temporary: false,
			allowed_payment_methods: [ 'WPCOM_Billing_Stripe_Payment_Method' ],
			total_tax_integer: 700,
			total_tax_display: 'R$7',
			total_cost_integer: 15600,
			total_cost_display: 'R$156',
			coupon_discounts_integer: [],
		};

		const countryList = [
			{
				code: 'AU',
				name: 'Australia',
			},
		];

		const store = applyMiddleware( thunk )( createStore )( () => {
			return {
				plans: { items: [] },
				sites: { items: {} },
				ui: { selectedSiteId: 123 },
				productsList: { items: [] },
				countries: { payments: countryList, domains: countryList },
			};
		} );

		MyCheckout = () => (
			<StripeHookProvider fetchStripeConfiguration={ fetchStripeConfiguration }>
				<ReduxProvider store={ store }>
					<CompositeCheckout
						siteSlug={ 'foo.com' }
						setCart={ mockSetCartEndpoint }
						getCart={ mockGetCartEndpointWith( initialCart ) }
						getStoredCards={ async () => [] }
						allowedPaymentMethods={ [ 'paypal' ] }
						onlyLoadPaymentMethods={ [ 'paypal' ] }
						overrideCountryList={ countryList }
					/>
				</ReduxProvider>
			</StripeHookProvider>
		);
	} );

	afterEach( () => {
		document.body.removeChild( container );
		container = null;
	} );

	it( 'renders the line items with prices', async () => {
		let renderResult;
		await act( async () => {
			renderResult = render( <MyCheckout />, container );
		} );
		const { getAllByLabelText } = renderResult;
		getAllByLabelText( 'WordPress.com Personal' ).map( element =>
			expect( element ).toHaveTextContent( 'R$144' )
		);
	} );

	it( 'renders the tax amount', async () => {
		let renderResult;
		await act( async () => {
			renderResult = render( <MyCheckout />, container );
		} );
		const { getAllByLabelText } = renderResult;
		getAllByLabelText( 'Tax' ).map( element => expect( element ).toHaveTextContent( 'R$7' ) );
	} );

	it( 'renders the total amount', async () => {
		let renderResult;
		await act( async () => {
			renderResult = render( <MyCheckout />, container );
		} );
		const { getAllByLabelText } = renderResult;
		getAllByLabelText( 'Total' ).map( element => expect( element ).toHaveTextContent( 'R$156' ) );
	} );
} );
