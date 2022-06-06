/**
 * @jest-environment jsdom
 */
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { ShoppingCartProvider, createShoppingCartManagerClient } from '@automattic/shopping-cart';
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider as ReduxProvider } from 'react-redux';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import CompositeCheckout from '../composite-checkout';
import {
	siteId,
	planWithoutDomain,
	fetchStripeConfiguration,
	mockSetCartEndpointWith,
	mockGetCartEndpointWith,
	getActivePersonalPlanDataForType,
	createTestReduxStore,
	countryList,
} from './util';

/* eslint-disable jest/no-conditional-expect */

jest.mock( 'calypso/state/sites/selectors' );
jest.mock( 'calypso/state/sites/domains/selectors' );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer' );
jest.mock( 'calypso/state/sites/plans/selectors/get-plans-by-site' );
jest.mock( 'calypso/my-sites/checkout/use-cart-key' );
jest.mock( 'calypso/lib/analytics/utils/refresh-country-code-cookie-gdpr' );
jest.mock( 'calypso/state/products-list/selectors/is-marketplace-product' );
jest.mock( 'calypso/lib/navigate' );

describe( 'CompositeCheckout', () => {
	let container;
	let MyCheckout;

	beforeEach( () => {
		jest.clearAllMocks();
		getPlansBySiteId.mockImplementation( () => ( {
			data: getActivePersonalPlanDataForType( 'yearly' ),
		} ) );
		hasLoadedSiteDomains.mockImplementation( () => true );
		getDomainsBySiteId.mockImplementation( () => [] );
		isMarketplaceProduct.mockImplementation( () => false );
		isJetpackSite.mockImplementation( () => false );

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
			total_tax_integer: 700,
			total_tax_display: 'R$7',
			total_cost_integer: 15600,
			total_cost_display: 'R$156',
			sub_total_integer: 15600,
			sub_total_display: 'R$156',
			coupon_discounts_integer: [],
		};

		const mockSetCartEndpoint = mockSetCartEndpointWith( {
			currency: initialCart.currency,
			locale: initialCart.locale,
		} );

		const store = createTestReduxStore();

		MyCheckout = ( { cartChanges, additionalProps, additionalCartProps, useUndefinedCartKey } ) => {
			const managerClient = createShoppingCartManagerClient( {
				getCart: mockGetCartEndpointWith( { ...initialCart, ...( cartChanges ?? {} ) } ),
				setCart: mockSetCartEndpoint,
			} );
			const mainCartKey = 'foo.com';
			useCartKey.mockImplementation( () => ( useUndefinedCartKey ? undefined : mainCartKey ) );
			nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/logstash' ).reply( 200 );
			Object.defineProperty( window, 'matchMedia', {
				writable: true,
				value: jest.fn().mockImplementation( ( query ) => ( {
					matches: false,
					media: query,
					onchange: null,
					addListener: jest.fn(), // deprecated
					removeListener: jest.fn(), // deprecated
					addEventListener: jest.fn(),
					removeEventListener: jest.fn(),
					dispatchEvent: jest.fn(),
				} ) ),
			} );
			return (
				<ReduxProvider store={ store }>
					<ShoppingCartProvider
						managerClient={ managerClient }
						options={ {
							defaultCartKey: useUndefinedCartKey ? undefined : mainCartKey,
						} }
						{ ...additionalCartProps }
					>
						<StripeHookProvider fetchStripeConfiguration={ fetchStripeConfiguration }>
							<CompositeCheckout
								siteId={ siteId }
								siteSlug={ 'foo.com' }
								getStoredCards={ async () => [] }
								overrideCountryList={ countryList }
								{ ...additionalProps }
							/>
						</StripeHookProvider>
					</ShoppingCartProvider>
				</ReduxProvider>
			);
		};
	} );

	afterEach( () => {
		document.body.removeChild( container );
		container = null;
	} );

	it( 'renders the paypal payment method option', async () => {
		render( <MyCheckout />, container );
		await waitFor( () => {
			expect( screen.getByText( 'PayPal' ) ).toBeInTheDocument();
		} );
	} );

	it( 'does not render the full credits payment method option when no credits are available', async () => {
		render( <MyCheckout />, container );
		await waitFor( () => {
			expect( screen.queryByText( /WordPress.com Credits:/ ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'does not render the full credits payment method option when partial credits are available', async () => {
		const cartChanges = { credits_integer: 15400, credits_display: 'R$154' };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.queryByText( /WordPress.com Credits:/ ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'renders the paypal payment method option when partial credits are available', async () => {
		const cartChanges = { credits_integer: 15400, credits_display: 'R$154' };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.getByText( 'PayPal' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders the full credits payment method option when full credits are available', async () => {
		const cartChanges = {
			sub_total_integer: 0,
			sub_total_display: '0',
			credits_integer: 15600,
			credits_display: 'R$156',
		};
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.getByText( /WordPress.com Credits:/ ) ).toBeInTheDocument();
		} );
	} );

	it( 'does not render the other payment method options when full credits are available', async () => {
		const cartChanges = {
			sub_total_integer: 0,
			sub_total_display: '0',
			credits_integer: 15600,
			credits_display: 'R$156',
		};
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.queryByText( 'PayPal' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'does not render the free payment method option when the purchase is not free', async () => {
		render( <MyCheckout />, container );
		await waitFor( () => {
			expect( screen.queryByText( 'Free Purchase' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'does not render the paypal payment method option when the purchase is free', async () => {
		const cartChanges = { total_cost_integer: 0, total_cost_display: '0' };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.queryByText( 'PayPal' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'does not render the full credits payment method option when full credits are available but the purchase is free', async () => {
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
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.queryByText( /WordPress.com Credits:/ ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'renders the free payment method option when the purchase is free', async () => {
		const cartChanges = { total_cost_integer: 0, total_cost_display: '0' };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect( screen.getByText( 'Free Purchase' ) ).toBeInTheDocument();
		} );
	} );

	it( 'does not render the contact step when the purchase is free', async () => {
		const cartChanges = { total_cost_integer: 0, total_cost_display: '0' };
		render( <MyCheckout cartChanges={ cartChanges } />, container );
		await waitFor( () => {
			expect(
				screen.queryByText( /Enter your (billing|contact) information/ )
			).not.toBeInTheDocument();
		} );
	} );
} );
