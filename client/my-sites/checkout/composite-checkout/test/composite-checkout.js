/**
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider as ReduxProvider } from 'react-redux';
import '@testing-library/jest-dom/extend-expect'; // eslint-disable-line import/no-extraneous-dependencies
import { render, act, fireEvent } from '@testing-library/react'; // eslint-disable-line import/no-extraneous-dependencies

/**
 * Internal dependencies
 */
import CompositeCheckout from '../composite-checkout';
import { StripeHookProvider } from 'lib/stripe';

jest.mock( 'page', () => ( {
	redirect: jest.fn(),
} ) );

const domainProduct = {
	product_name: '.cash Domain',
	product_slug: 'domain_reg',
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
	is_domain_registration: true,
	item_subtotal_integer: 500,
	item_subtotal_display: 'R$5',
};

const domainTransferProduct = {
	product_name: '.cash Domain',
	product_slug: 'domain_transfer',
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
};

const planWithBundledDomain = {
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
};

const planWithoutDomain = {
	product_name: 'WordPress.com Personal',
	product_slug: 'personal_bundle',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	free_trial: false,
	meta: '',
	product_id: 1009,
	volume: 1,
	item_subtotal_integer: 14400,
	item_subtotal_display: 'R$144',
};

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
		page.redirect.mockReset();
		container = document.createElement( 'div' );
		document.body.appendChild( container );

		const initialCart = {
			coupon: '',
			currency: 'BRL',
			locale: 'br-pt',
			is_coupon_applied: false,
			products: [ planWithoutDomain ],
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
			sub_total_integer: 15600,
			sub_total_display: 'R$156',
			coupon_discounts_integer: [],
		};

		const countryList = [
			{
				code: 'US',
				name: 'United States',
			},
			{
				code: 'AU',
				name: 'Australia',
			},
		];

		const store = applyMiddleware( thunk )( createStore )( () => {
			return {
				plans: {
					items: [
						{
							product_id: 1009,
							product_name: 'Plan',
							meta: null,
							prices: {},
							path_slug: 'personal',
							product_slug: 'personal-bundle',
							product_type: 'bundle',
							currency_code: 'USD',
						},
					],
				},
				sites: { items: {} },
				ui: { selectedSiteId: 123 },
				productsList: {
					items: {
						domain_map: {
							product_id: 5,
							product_name: 'Product',
							product_slug: 'domain_map',
							prices: {},
						},
					},
				},
				countries: { payments: countryList, domains: countryList },
			};
		} );

		MyCheckout = ( { cartChanges, additionalProps } ) => (
			<StripeHookProvider fetchStripeConfiguration={ fetchStripeConfiguration }>
				<ReduxProvider store={ store }>
					<CompositeCheckout
						siteSlug={ 'foo.com' }
						setCart={ mockSetCartEndpoint }
						getCart={ mockGetCartEndpointWith( { ...initialCart, ...( cartChanges ?? {} ) } ) }
						getStoredCards={ async () => [] }
						allowedPaymentMethods={ [ 'paypal' ] }
						onlyLoadPaymentMethods={ [ 'paypal', 'full-credits', 'free-purchase' ] }
						overrideCountryList={ countryList }
						{ ...additionalProps }
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

	it( 'renders the paypal payment method option', async () => {
		let renderResult;
		await act( async () => {
			renderResult = render( <MyCheckout />, container );
		} );
		const { getByText } = renderResult;
		expect( getByText( 'Paypal' ) ).toBeInTheDocument();
	} );

	it( 'does not render the full credits payment method option when no credits are available', async () => {
		let renderResult;
		await act( async () => {
			renderResult = render( <MyCheckout />, container );
		} );
		const { queryByText } = renderResult;
		expect( queryByText( /WordPress.com Credits:/ ) ).not.toBeInTheDocument();
	} );

	it( 'does not render the full credits payment method option when partial credits are available', async () => {
		let renderResult;
		const cartChanges = { credits_integer: 15400, credits_display: 'R$154' };
		await act( async () => {
			renderResult = render( <MyCheckout cartChanges={ cartChanges } />, container );
		} );
		const { queryByText } = renderResult;
		expect( queryByText( /WordPress.com Credits:/ ) ).not.toBeInTheDocument();
	} );

	it( 'renders the paypal payment method option when partial credits are available', async () => {
		let renderResult;
		const cartChanges = { credits_integer: 15400, credits_display: 'R$154' };
		await act( async () => {
			renderResult = render( <MyCheckout cartChanges={ cartChanges } />, container );
		} );
		const { getByText } = renderResult;
		expect( getByText( 'Paypal' ) ).toBeInTheDocument();
	} );

	it( 'renders the full credits payment method option when full credits are available', async () => {
		let renderResult;
		const cartChanges = { credits_integer: 15600, credits_display: 'R$156' };
		await act( async () => {
			renderResult = render( <MyCheckout cartChanges={ cartChanges } />, container );
		} );
		const { getByText } = renderResult;
		expect( getByText( /WordPress.com Credits:/ ) ).toBeInTheDocument();
	} );

	it( 'renders the paypal payment method option when full credits are available', async () => {
		let renderResult;
		const cartChanges = { credits_integer: 15600, credits_display: 'R$156' };
		await act( async () => {
			renderResult = render( <MyCheckout cartChanges={ cartChanges } />, container );
		} );
		const { getByText } = renderResult;
		expect( getByText( 'Paypal' ) ).toBeInTheDocument();
	} );

	it( 'does not render the free payment method option when the purchase is not free', async () => {
		let renderResult;
		await act( async () => {
			renderResult = render( <MyCheckout />, container );
		} );
		const { queryByText } = renderResult;
		expect( queryByText( 'Free Purchase' ) ).not.toBeInTheDocument();
	} );

	it( 'does not render the paypal payment method option when the purchase is free', async () => {
		let renderResult;
		const cartChanges = { total_cost_integer: 0, total_cost_display: '0' };
		await act( async () => {
			renderResult = render( <MyCheckout cartChanges={ cartChanges } />, container );
		} );
		const { queryByText } = renderResult;
		expect( queryByText( 'Paypal' ) ).not.toBeInTheDocument();
	} );

	it( 'does not render the full credits payment method option when full credits are available but the purchase is free', async () => {
		let renderResult;
		const cartChanges = {
			total_cost_integer: 0,
			total_cost_display: '0',
			credits_integer: 15600,
			credits_display: 'R$156',
		};
		await act( async () => {
			renderResult = render( <MyCheckout cartChanges={ cartChanges } />, container );
		} );
		const { queryByText } = renderResult;
		expect( queryByText( /WordPress.com Credits:/ ) ).not.toBeInTheDocument();
	} );

	it( 'renders the free payment method option when the purchase is free', async () => {
		let renderResult;
		const cartChanges = { total_cost_integer: 0, total_cost_display: '0' };
		await act( async () => {
			renderResult = render( <MyCheckout cartChanges={ cartChanges } />, container );
		} );
		const { getByText } = renderResult;
		expect( getByText( 'Free Purchase' ) ).toBeInTheDocument();
	} );

	it( 'does not render the contact step when the purchase is free', async () => {
		let renderResult;
		const cartChanges = { total_cost_integer: 0, total_cost_display: '0' };
		await act( async () => {
			renderResult = render( <MyCheckout cartChanges={ cartChanges } />, container );
		} );
		const { queryByText } = renderResult;
		expect( queryByText( /Enter your (billing|contact) information/ ) ).not.toBeInTheDocument();
	} );

	it( 'renders the contact step when the purchase is not free', async () => {
		let renderResult;
		await act( async () => {
			renderResult = render( <MyCheckout />, container );
		} );
		const { getByText } = renderResult;
		expect( getByText( /Enter your (billing|contact) information/ ) ).toBeInTheDocument();
	} );

	it( 'renders the tax fields only when no domain is in the cart', async () => {
		let renderResult;
		const cartChanges = { products: [ planWithoutDomain ] };
		await act( async () => {
			renderResult = render( <MyCheckout cartChanges={ cartChanges } />, container );
		} );
		const { getByText, queryByText } = renderResult;
		expect( getByText( 'Postal code' ) ).toBeInTheDocument();
		expect( getByText( 'Country' ) ).toBeInTheDocument();
		expect( queryByText( 'Phone' ) ).not.toBeInTheDocument();
		expect( queryByText( 'Email' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the domain fields when a domain is in the cart', async () => {
		let renderResult;
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		await act( async () => {
			renderResult = render( <MyCheckout cartChanges={ cartChanges } />, container );
		} );
		const { getByText } = renderResult;
		expect( getByText( 'Country' ) ).toBeInTheDocument();
		expect( getByText( 'Phone' ) ).toBeInTheDocument();
		expect( getByText( 'Email' ) ).toBeInTheDocument();
	} );

	it( 'renders the domain fields when a domain transfer is in the cart', async () => {
		let renderResult;
		const cartChanges = { products: [ planWithBundledDomain, domainTransferProduct ] };
		await act( async () => {
			renderResult = render( <MyCheckout cartChanges={ cartChanges } />, container );
		} );
		const { getByText } = renderResult;
		expect( getByText( 'Country' ) ).toBeInTheDocument();
		expect( getByText( 'Phone' ) ).toBeInTheDocument();
		expect( getByText( 'Email' ) ).toBeInTheDocument();
	} );

	it( 'does not render country-specific domain fields when no country has been chosen and a domain is in the cart', async () => {
		let renderResult;
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		await act( async () => {
			renderResult = render( <MyCheckout cartChanges={ cartChanges } />, container );
		} );
		const { getByText, queryByText } = renderResult;
		expect( getByText( 'Country' ) ).toBeInTheDocument();
		expect( getByText( 'Phone' ) ).toBeInTheDocument();
		expect( getByText( 'Email' ) ).toBeInTheDocument();
		expect( queryByText( 'Address' ) ).not.toBeInTheDocument();
		expect( queryByText( 'City' ) ).not.toBeInTheDocument();
		expect( queryByText( 'State' ) ).not.toBeInTheDocument();
		expect( queryByText( 'ZIP code' ) ).not.toBeInTheDocument();
	} );

	it( 'renders country-specific domain fields when a country has been chosen and a domain is in the cart', async () => {
		let renderResult;
		const cartChanges = { products: [ planWithBundledDomain, domainProduct ] };
		await act( async () => {
			renderResult = render( <MyCheckout cartChanges={ cartChanges } />, container );
		} );
		const { getByText, getByLabelText } = renderResult;
		fireEvent.change( getByLabelText( 'Country' ), { target: { value: 'US' } } );
		expect( getByText( 'Country' ) ).toBeInTheDocument();
		expect( getByText( 'Phone' ) ).toBeInTheDocument();
		expect( getByText( 'Email' ) ).toBeInTheDocument();
		expect( getByText( 'Address' ) ).toBeInTheDocument();
		expect( getByText( 'City' ) ).toBeInTheDocument();
		expect( getByText( 'State' ) ).toBeInTheDocument();
		expect( getByText( 'ZIP code' ) ).toBeInTheDocument();
	} );

	it( 'renders the checkout greeting header', async () => {
		let renderResult;
		await act( async () => {
			renderResult = render( <MyCheckout />, container );
		} );
		const { getByText } = renderResult;
		expect( getByText( 'You are all set to check out' ) ).toBeInTheDocument();
		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	it( 'redirects to the plans page if the cart is empty when it loads', async () => {
		const cartChanges = { products: [] };
		await act( async () => {
			render( <MyCheckout cartChanges={ cartChanges } />, container );
		} );
		expect( page.redirect ).toHaveBeenCalledWith( '/plans/foo.com' );
	} );

	it( 'does not redirect if the cart is empty when it loads but the url has a plan alias', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { product: 'personal' };
		await act( async () => {
			render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	it( 'adds the aliased plan to the cart when the url has a plan alias', async () => {
		let renderResult;
		const cartChanges = { products: [] };
		const additionalProps = { product: 'personal' };
		await act( async () => {
			renderResult = render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		const { getAllByLabelText } = renderResult;
		getAllByLabelText( 'WordPress.com Personal' ).map( element =>
			expect( element ).toHaveTextContent( 'R$144' )
		);
	} );

	it( 'does not redirect if the cart is empty when it loads but the url has a domain map', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { product: 'domain-mapping:bar.com' };
		await act( async () => {
			render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	it( 'adds the domain mapping product to the cart when the url has a domain map', async () => {
		let renderResult;
		const cartChanges = { products: [ planWithoutDomain ] };
		const additionalProps = { product: 'domain-mapping:bar.com' };
		await act( async () => {
			renderResult = render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		const { getAllByLabelText } = renderResult;
		getAllByLabelText( 'WordPress.com Personal' ).map( element =>
			expect( element ).toHaveTextContent( 'R$144' )
		);
		getAllByLabelText( 'Domain Mapping: bar.com' ).map( element =>
			expect( element ).toHaveTextContent( 'R$0' )
		);
	} );

	it( 'adds the coupon to the cart when the url has a coupon code', async () => {
		let renderResult;
		const cartChanges = { products: [ planWithoutDomain ] };
		const additionalProps = { couponCode: 'MYCOUPONCODE' };
		await act( async () => {
			renderResult = render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		const { getAllByLabelText } = renderResult;
		getAllByLabelText( 'WordPress.com Personal' ).map( element =>
			expect( element ).toHaveTextContent( 'R$144' )
		);
		getAllByLabelText( 'Coupon: MYCOUPONCODE' ).map( element =>
			expect( element ).toHaveTextContent( '-$0' )
		);
	} );

	it( 'displays loading while old cart store is loading', async () => {
		let renderResult;
		const additionalProps = {
			cart: { hasLoadedFromServer: false, hasPendingServerUpdates: false },
		};
		await act( async () => {
			renderResult = render( <MyCheckout additionalProps={ additionalProps } />, container );
		} );
		const { getByText } = renderResult;
		expect( getByText( 'Loading checkout' ) ).toBeInTheDocument();
	} );

	it( 'displays loading while old cart store has pending updates', async () => {
		let renderResult;
		const additionalProps = { cart: { hasLoadedFromServer: true, hasPendingServerUpdates: true } };
		await act( async () => {
			renderResult = render( <MyCheckout additionalProps={ additionalProps } />, container );
		} );
		const { getByText } = renderResult;
		expect( getByText( 'Loading checkout' ) ).toBeInTheDocument();
	} );

	it( 'does not display loading when old cart store has pending updates and then they complete', async () => {
		let renderResult;
		let additionalProps = { cart: { hasLoadedFromServer: true, hasPendingServerUpdates: true } };
		await act( async () => {
			renderResult = render( <MyCheckout additionalProps={ additionalProps } />, container );
		} );
		const { queryByText, rerender } = renderResult;
		additionalProps = { cart: { hasLoadedFromServer: true, hasPendingServerUpdates: false } };
		await act( async () => {
			rerender( <MyCheckout additionalProps={ additionalProps } />, container );
		} );
		expect( queryByText( 'Loading checkout' ) ).not.toBeInTheDocument();
	} );
} );

async function mockSetCartEndpoint( _, requestCart ) {
	const {
		products: requestProducts,
		currency: requestCurrency,
		coupon: requestCoupon,
		locale: requestLocale,
	} = requestCart;
	const products = requestProducts.map( convertRequestProductToResponseProduct( requestCurrency ) );

	const taxInteger = products.reduce( ( accum, current ) => {
		return accum + current.item_tax;
	}, 0 );

	const totalInteger = products.reduce( ( accum, current ) => {
		return accum + current.item_subtotal_integer;
	}, taxInteger );

	return {
		products,
		locale: requestLocale,
		currency: requestCurrency,
		credits_integer: 0,
		credits_display: '0',
		allowed_payment_methods: [
			'WPCOM_Billing_Stripe_Payment_Method',
			'WPCOM_Billing_Ebanx',
			'WPCOM_Billing_Web_Payment',
		],
		total_tax_display: 'R$7',
		total_tax_integer: taxInteger,
		total_cost_display: 'R$156',
		total_cost_integer: totalInteger,
		sub_total_display: 'R$149',
		sub_total_integer: totalInteger - taxInteger,
		coupon: requestCoupon,
		is_coupon_applied: true,
		coupon_discounts_integer: [],
		tax: {},
	};
}

function convertRequestProductToResponseProduct( currency ) {
	return product => {
		const { product_id } = product;

		switch ( product_id ) {
			case 1009: // WPCOM Personal Bundle
				return {
					product_id: 1009,
					product_name: 'WordPress.com Personal',
					product_slug: 'personal-bundle',
					currency: currency,
					is_domain_registration: false,
					item_subtotal_integer: 14400,
					item_subtotal_display: 'R$144',
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 5:
				return {
					product_id: 5,
					product_name: 'Domain Mapping',
					product_slug: 'domain_map',
					currency: currency,
					is_domain_registration: false,
					item_subtotal_integer: 0,
					item_subtotal_display: 'R$0',
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 6:
				return {
					product_id: 6,
					product_name: 'Domain Registration',
					product_slug: 'domain_reg',
					currency: currency,
					is_domain_registration: true,
					item_subtotal_integer: 70,
					item_subtotal_display: 'R$70',
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
		}

		return {
			product_id: product_id,
			product_name: `Unknown mocked product: ${ product_id }`,
			product_slug: 'unknown',
			currency: currency,
			is_domain_registration: false,
			item_subtotal_integer: 0,
			item_subtotal_display: '$0',
			item_tax: 0,
		};
	};
}

function mockGetCartEndpointWith( initialCart ) {
	return async () => {
		return initialCart;
	};
}
