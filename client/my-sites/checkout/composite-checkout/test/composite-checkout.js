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
import '@testing-library/jest-dom/extend-expect';
import { render, act, fireEvent } from '@testing-library/react';
import { ShoppingCartProvider } from '@automattic/shopping-cart';
import { StripeHookProvider } from '@automattic/calypso-stripe';

/**
 * Internal dependencies
 */
import CompositeCheckout from '../composite-checkout';

/**
 * Mocked dependencies
 */
jest.mock( 'calypso/state/sites/selectors' );
import { isJetpackSite } from 'calypso/state/sites/selectors';
jest.mock( 'calypso/state/selectors/is-site-automated-transfer' );
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';

jest.mock( 'page', () => ( {
	redirect: jest.fn(),
} ) );

jest.mock( 'calypso/components/data/query-experiments' );

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
	item_original_cost_integer: 500,
	item_original_cost_display: 'R$5',
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
	item_original_cost_integer: 500,
	item_original_cost_display: 'R$5',
	item_subtotal_integer: 500,
	item_subtotal_display: 'R$5',
};

const planWithBundledDomain = {
	product_name: 'WordPress.com Personal',
	product_slug: 'personal-bundle',
	currency: 'BRL',
	extra: {
		context: 'signup',
		domain_to_bundle: 'foo.cash',
	},
	free_trial: false,
	meta: '',
	product_id: 1009,
	volume: 1,
	item_original_cost_integer: 14400,
	item_original_cost_display: 'R$144',
	item_subtotal_integer: 14400,
	item_subtotal_display: 'R$144',
};

const planWithoutDomain = {
	product_name: 'WordPress.com Personal',
	product_slug: 'personal-bundle',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	free_trial: false,
	meta: '',
	product_id: 1009,
	volume: 1,
	item_original_cost_integer: 14400,
	item_original_cost_display: 'R$144',
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
		jest.clearAllMocks();
		container = document.createElement( 'div' );
		document.body.appendChild( container );

		const initialCart = {
			coupon: '',
			coupon_savings_total: 0,
			coupon_savings_total_integer: 0,
			coupon_savings_total_display: '0',
			currency: 'BRL',
			locale: 'br-pt',
			is_coupon_applied: false,
			products: [ planWithoutDomain ],
			tax: {
				display_taxes: true,
				location: {},
			},
			temporary: false,
			allowed_payment_methods: [ 'WPCOM_Billing_PayPal_Express' ],
			savings_total_integer: 0,
			savings_total_display: 'R$0',
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
					items: [],
				},
				sites: { items: {} },
				siteSettings: { items: {} },
				ui: { selectedSiteId: 123 },
				productsList: {
					items: {
						'personal-bundle': {
							product_id: 1009,
							product_name: 'Plan',
							product_slug: 'personal-bundle',
							prices: {},
						},
						domain_map: {
							product_id: 5,
							product_name: 'Product',
							product_slug: 'domain_map',
							prices: {},
						},
						domain_reg: {
							product_id: 6,
							product_name: 'Product',
							product_slug: 'domain_reg',
							prices: {},
						},
						premium_theme: {
							product_id: 39,
							product_name: 'Product',
							product_slug: 'premium_theme',
							prices: {},
						},
						'concierge-session': {
							product_id: 371,
							product_name: 'Product',
							product_slug: 'concierge-session',
							prices: {},
						},
						jetpack_backup_daily: {
							product_id: 2100,
							product_name: 'Jetpack Backup (Daily)',
							product_slug: 'jetpack_backup_daily',
							prices: {},
						},
						jetpack_scan: {
							product_id: 2106,
							product_name: 'Jetpack Scan Daily',
							product_slug: 'jetpack_scan',
							prices: {},
						},
					},
				},
				purchases: {},
				countries: { payments: countryList, domains: countryList },
			};
		} );

		MyCheckout = ( { cartChanges, additionalProps, additionalCartProps } ) => (
			<ReduxProvider store={ store }>
				<ShoppingCartProvider
					cartKey={ 'foo.com' }
					setCart={ mockSetCartEndpoint }
					getCart={ mockGetCartEndpointWith( { ...initialCart, ...( cartChanges ?? {} ) } ) }
					{ ...additionalCartProps }
				>
					<StripeHookProvider fetchStripeConfiguration={ fetchStripeConfiguration }>
						<CompositeCheckout
							siteSlug={ 'foo.com' }
							getStoredCards={ async () => [] }
							overrideCountryList={ countryList }
							{ ...additionalProps }
						/>
					</StripeHookProvider>
				</ShoppingCartProvider>
			</ReduxProvider>
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
		getAllByLabelText( 'WordPress.com Personal' ).map( ( element ) =>
			expect( element ).toHaveTextContent( 'R$144' )
		);
	} );

	it( 'renders the tax amount', async () => {
		let renderResult;
		await act( async () => {
			renderResult = render( <MyCheckout />, container );
		} );
		const { getAllByLabelText } = renderResult;
		getAllByLabelText( 'Tax' ).map( ( element ) => expect( element ).toHaveTextContent( 'R$7' ) );
	} );

	it( 'renders the total amount', async () => {
		let renderResult;
		await act( async () => {
			renderResult = render( <MyCheckout />, container );
		} );
		const { getAllByLabelText } = renderResult;
		getAllByLabelText( 'Total' ).map( ( element ) =>
			expect( element ).toHaveTextContent( 'R$156' )
		);
	} );

	it( 'renders the paypal payment method option', async () => {
		let renderResult;
		await act( async () => {
			renderResult = render( <MyCheckout />, container );
		} );
		const { getByText } = renderResult;
		expect( getByText( 'PayPal' ) ).toBeInTheDocument();
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
		expect( getByText( 'PayPal' ) ).toBeInTheDocument();
	} );

	it( 'renders the full credits payment method option when full credits are available', async () => {
		let renderResult;
		const cartChanges = {
			sub_total_integer: 0,
			sub_total_display: '0',
			credits_integer: 15600,
			credits_display: 'R$156',
		};
		await act( async () => {
			renderResult = render( <MyCheckout cartChanges={ cartChanges } />, container );
		} );
		const { getByText } = renderResult;
		expect( getByText( /WordPress.com Credits:/ ) ).toBeInTheDocument();
	} );

	it( 'does not render the other payment method options when full credits are available', async () => {
		let renderResult;
		const cartChanges = {
			sub_total_integer: 0,
			sub_total_display: '0',
			credits_integer: 15600,
			credits_display: 'R$156',
		};
		await act( async () => {
			renderResult = render( <MyCheckout cartChanges={ cartChanges } />, container );
		} );
		const { queryByText } = renderResult;
		expect( queryByText( 'PayPal' ) ).not.toBeInTheDocument();
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
		expect( queryByText( 'PayPal' ) ).not.toBeInTheDocument();
	} );

	it( 'does not render the full credits payment method option when full credits are available but the purchase is free', async () => {
		let renderResult;
		const cartChanges = {
			sub_total_integer: 0,
			sub_total_display: '0',
			total_tax_integer: 0,
			total_tax_display: 'R$0',
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

	it( 'renders the checkout summary', async () => {
		let renderResult;
		await act( async () => {
			renderResult = render( <MyCheckout />, container );
		} );
		const { getByText } = renderResult;
		expect( getByText( 'Purchase Details' ) ).toBeInTheDocument();
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
		const additionalProps = { productAliasFromUrl: 'personal' };
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
		const additionalProps = { productAliasFromUrl: 'personal' };
		await act( async () => {
			renderResult = render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		const { getAllByLabelText } = renderResult;
		getAllByLabelText( 'WordPress.com Personal' ).map( ( element ) =>
			expect( element ).toHaveTextContent( 'R$144' )
		);
	} );

	it( 'adds the product to the cart when the url has a jetpack product', async () => {
		isJetpackSite.mockImplementation( () => true );
		isAtomicSite.mockImplementation( () => false );

		let renderResult;
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'jetpack_scan' };
		await act( async () => {
			renderResult = render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		const { getAllByLabelText } = renderResult;
		getAllByLabelText( 'Jetpack Scan Daily' ).map( ( element ) =>
			expect( element ).toHaveTextContent( 'R$41' )
		);
	} );

	it( 'adds two products to the cart when the url has two jetpack products', async () => {
		isJetpackSite.mockImplementation( () => true );
		isAtomicSite.mockImplementation( () => false );

		let renderResult;
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'jetpack_scan,jetpack_backup_daily' };
		await act( async () => {
			renderResult = render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		const { getAllByLabelText } = renderResult;
		getAllByLabelText( 'Jetpack Scan Daily' ).map( ( element ) =>
			expect( element ).toHaveTextContent( 'R$41' )
		);
		getAllByLabelText( 'Jetpack Backup (Daily)' ).map( ( element ) =>
			expect( element ).toHaveTextContent( 'R$42' )
		);
	} );

	it( 'does not redirect if the cart is empty when it loads but the url has a concierge session', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'concierge-session' };
		await act( async () => {
			render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	it( 'adds the domain mapping product to the cart when the url has a concierge session', async () => {
		let renderResult;
		const cartChanges = { products: [ planWithoutDomain ] };
		const additionalProps = { productAliasFromUrl: 'concierge-session' };
		await act( async () => {
			renderResult = render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		const { getAllByLabelText } = renderResult;
		getAllByLabelText( 'WordPress.com Personal' ).map( ( element ) =>
			expect( element ).toHaveTextContent( 'R$144' )
		);
		getAllByLabelText( 'Support Session' ).map( ( element ) =>
			expect( element ).toHaveTextContent( 'R$49' )
		);
	} );

	it( 'does not redirect if the cart is empty when it loads but the url has a theme', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'theme:ovation' };
		await act( async () => {
			render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	it( 'adds the domain mapping product to the cart when the url has a theme', async () => {
		let renderResult;
		const cartChanges = { products: [ planWithoutDomain ] };
		const additionalProps = { productAliasFromUrl: 'theme:ovation' };
		await act( async () => {
			renderResult = render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		const { getAllByLabelText } = renderResult;
		getAllByLabelText( 'WordPress.com Personal' ).map( ( element ) =>
			expect( element ).toHaveTextContent( 'R$144' )
		);
		getAllByLabelText( 'Premium Theme: Ovation' ).map( ( element ) =>
			expect( element ).toHaveTextContent( 'R$69' )
		);
	} );

	it( 'does not redirect if the cart is empty when it loads but the url has a domain map', async () => {
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'domain-mapping:bar.com' };
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
		const additionalProps = { productAliasFromUrl: 'domain-mapping:bar.com' };
		await act( async () => {
			renderResult = render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		const { getAllByLabelText, getAllByText } = renderResult;
		getAllByLabelText( 'WordPress.com Personal' ).map( ( element ) =>
			expect( element ).toHaveTextContent( 'R$144' )
		);
		expect( getAllByText( 'Domain Mapping: billed annually' ) ).toHaveLength( 2 );
		getAllByLabelText( 'bar.com' ).map( ( element ) =>
			expect( element ).toHaveTextContent( 'R$0' )
		);
	} );

	it( 'adds renewal product to the cart when the url has a renewal', async () => {
		let renderResult;
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'personal-bundle', purchaseId: '12345' };
		await act( async () => {
			renderResult = render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		const { getAllByLabelText } = renderResult;
		getAllByLabelText( 'WordPress.com Personal' ).map( ( element ) =>
			expect( element ).toHaveTextContent( 'R$144' )
		);
	} );

	it( 'adds renewal product to the cart when the url has a renewal with a domain registration', async () => {
		let renderResult;
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'domain_reg:foo.cash', purchaseId: '12345' };
		await act( async () => {
			renderResult = render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		const { getAllByText } = renderResult;
		expect( getAllByText( 'Domain Registration: billed annually' ) ).toHaveLength( 2 );
		expect( getAllByText( 'foo.cash' ) ).toHaveLength( 3 );
	} );

	it( 'adds renewal product to the cart when the url has a renewal with a domain mapping', async () => {
		let renderResult;
		const cartChanges = { products: [] };
		const additionalProps = { productAliasFromUrl: 'domain_map:bar.com', purchaseId: '12345' };
		await act( async () => {
			renderResult = render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		const { getAllByText } = renderResult;
		expect( getAllByText( 'Domain Mapping: billed annually' ) ).toHaveLength( 2 );
		expect( getAllByText( 'bar.com' ) ).toHaveLength( 2 );
	} );

	it( 'adds renewal products to the cart when the url has multiple renewals', async () => {
		let renderResult;
		const cartChanges = { products: [] };
		const additionalProps = {
			productAliasFromUrl: 'domain_map:bar.com,domain_reg:bar.com',
			purchaseId: '12345,54321',
		};
		await act( async () => {
			renderResult = render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		const { getAllByText } = renderResult;
		expect( getAllByText( 'Domain Mapping: billed annually' ) ).toHaveLength( 2 );
		expect( getAllByText( 'Domain Registration: billed annually' ) ).toHaveLength( 2 );
		expect( getAllByText( 'bar.com' ) ).toHaveLength( 5 );
	} );

	it( 'adds the coupon to the cart when the url has a coupon code', async () => {
		let renderResult;
		const cartChanges = { products: [ planWithoutDomain ] };
		const additionalProps = {
			couponCode: 'MYCOUPONCODE',
			coupon_savings_total_integer: 10,
			coupon_savings_total_display: '$R10',
		};
		await act( async () => {
			renderResult = render(
				<MyCheckout cartChanges={ cartChanges } additionalProps={ additionalProps } />,
				container
			);
		} );
		const { getAllByLabelText } = renderResult;
		getAllByLabelText( 'WordPress.com Personal' ).map( ( element ) =>
			expect( element ).toHaveTextContent( 'R$144' )
		);
		getAllByLabelText( 'Coupon: MYCOUPONCODE' ).map( ( element ) =>
			expect( element ).toHaveTextContent( 'R$10' )
		);
	} );

	it( 'displays loading while cart key is undefined (eg: when cart store has pending updates)', async () => {
		let renderResult;
		const additionalCartProps = { cartKey: undefined };
		await act( async () => {
			renderResult = render(
				<MyCheckout additionalCartProps={ additionalCartProps } />,
				container
			);
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
		allowed_payment_methods: [ 'WPCOM_Billing_PayPal_Express' ],
		coupon_savings_total_display: requestCoupon ? 'R$10' : 'R$0',
		coupon_savings_total_integer: requestCoupon ? 1000 : 0,
		savings_total_display: requestCoupon ? 'R$10' : 'R$0',
		savings_total_integer: requestCoupon ? 1000 : 0,
		total_tax_display: 'R$7',
		total_tax_integer: taxInteger,
		total_cost_display: 'R$156',
		total_cost_integer: totalInteger,
		sub_total_display: 'R$149',
		sub_total_integer: totalInteger - taxInteger,
		coupon: requestCoupon,
		is_coupon_applied: true,
		coupon_discounts_integer: [],
		tax: { location: {}, display_taxes: true },
	};
}

function convertRequestProductToResponseProduct( currency ) {
	return ( product ) => {
		const { product_id } = product;

		switch ( product_id ) {
			case 1009: // WPCOM Personal Bundle
				return {
					product_id: 1009,
					product_name: 'WordPress.com Personal',
					product_slug: 'personal-bundle',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 14400,
					item_original_cost_display: 'R$144',
					item_subtotal_integer: 14400,
					item_subtotal_display: 'R$144',
					months_per_bill_period: 12,
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
					item_original_cost_integer: 0,
					item_original_cost_display: 'R$0',
					item_subtotal_integer: 0,
					item_subtotal_display: 'R$0',
					months_per_bill_period: 12,
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
					item_original_cost_integer: 70,
					item_original_cost_display: 'R$70',
					item_subtotal_integer: 70,
					item_subtotal_display: 'R$70',
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 39:
				return {
					product_id: 39,
					product_name: 'Premium Theme: Ovation',
					product_slug: 'premium_theme',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 69,
					item_original_cost_display: 'R$69',
					item_subtotal_integer: 69,
					item_subtotal_display: 'R$69',
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 371:
				return {
					product_id: 371,
					product_name: 'Support Session',
					product_slug: 'concierge-session',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 49,
					item_original_cost_display: 'R$49',
					item_subtotal_integer: 49,
					item_subtotal_display: 'R$49',
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 2106:
				return {
					product_id: 2106,
					product_name: 'Jetpack Scan Daily',
					product_slug: 'jetpack_scan',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 4100,
					item_original_cost_display: 'R$41',
					item_subtotal_integer: 4100,
					item_subtotal_display: 'R$41',
					months_per_bill_period: 12,
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 2100:
				return {
					product_id: 2100,
					product_name: 'Jetpack Backup (Daily)',
					product_slug: 'jetpack_backup_daily',
					currency: currency,
					is_domain_registration: false,
					item_original_cost_integer: 4200,
					item_original_cost_display: 'R$42',
					item_subtotal_integer: 4200,
					item_subtotal_display: 'R$42',
					months_per_bill_period: 12,
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
			savings_total_display: '$0',
			savings_total_integer: 0,
			item_subtotal_display: '$0',
			item_subtotal_integer: 0,
			item_tax: 0,
		};
	};
}

function mockGetCartEndpointWith( initialCart ) {
	return async () => {
		return initialCart;
	};
}
