/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import { Plans, ProductsList } from '@automattic/data-stores';
import {
	createShoppingCartManagerClient,
	getEmptyResponseCart,
	ShoppingCartProvider,
} from '@automattic/shopping-cart';
import { CountryListItem } from '@automattic/wpcom-checkout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Provider as ReduxProvider } from 'react-redux';
import {
	mockCartEndpoint,
	mockGetSupportedCountriesEndpoint,
} from 'calypso/my-sites/checkout/src/test/util';
import { createReduxStore } from 'calypso/state';
import { PURCHASES_SITE_FETCH_COMPLETED } from 'calypso/state/action-types';
import { getInitialState, getStateFromCache } from 'calypso/state/initial-state';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import UpsellNudge, { BUSINESS_PLAN_UPGRADE_UPSELL, PROFESSIONAL_EMAIL_UPSELL } from '../index';
import type { StoredPaymentMethodCard } from '../../../../lib/checkout/payment-methods';

jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
} ) );

jest.mock( '@automattic/calypso-router', () => jest.fn() );
jest.mock( '@automattic/data-stores', () => ( {
	...jest.requireActual( '@automattic/data-stores' ),
	ProductsList: {
		...jest.requireActual( '@automattic/data-stores' ).ProductsList,
		useProducts: jest.fn(),
	},
	Plans: {
		...jest.requireActual( '@automattic/data-stores' ).Plans,
		usePlans: jest.fn(),
		useCurrentPlan: jest.fn(),
		usePricingMetaForGridPlans: jest.fn(),
	},
} ) );

const mockCountries: CountryListItem[] = [
	{ code: 'US', has_postal_codes: true, name: 'United States', vat_supported: false },
];

const mockDataStorePlans = {
	'business-bundle': {
		planSlug: 'business-bundle',
		pricing: {
			currencyCode: 'USD',
			billPeriod: 365,
			originalPrice: {
				full: 30000,
				monthly: 30000,
			},
			discountedPrice: {
				full: 30000,
				monthly: 30000,
			},
		},
	},
};

const mockDataStoreProducts = {
	'business-bundle': {
		id: 1008,
		productSlug: 'business-bundle',
	},

	wp_titan_mail_yearly: {
		id: 401,
		productSlug: 'wp_titan_mail_yearly',
	},

	wp_titan_mail_monthly: {
		id: 400,
		productSlug: 'wp_titan_mail_monthly',
	},
};

const mockProducts = {
	'business-bundle': {
		product_id: 1008,
		product_name: 'WordPress.com Business',
		product_slug: 'business-bundle',
		description: '',
		product_type: 'bundle',
		available: true,
		billing_product_slug: 'wp-bundle-business',
		is_domain_registration: false,
		cost_display: '$300.00',
		combined_cost_display: '$300.00',
		cost: 300,
		cost_smallest_unit: 30000,
		currency_code: 'USD',
		price_tier_list: [],
		price_tier_usage_quantity: null,
		product_term: 'année',
		price_tiers: [],
		price_tier_slug: '',
	},

	wp_titan_mail_yearly: {
		product_id: 401,
		product_name: 'Professional Email',
		product_slug: 'wp_titan_mail_yearly',
		description: '',
		product_type: '',
		available: true,
		billing_product_slug: 'titan-mail',
		is_domain_registration: false,
		cost_display: '$35.00',
		combined_cost_display: '$35.00',
		cost: 35,
		cost_smallest_unit: 3500,
		currency_code: 'USD',
		price_tier_list: [],
		price_tier_usage_quantity: null,
		product_term: 'year',
		price_tiers: [],
		price_tier_slug: '',
		introductory_offer: {
			interval_unit: 'month',
			interval_count: 3,
			usage_limit: null,
			cost_per_interval: 0,
			transition_after_renewal_count: 0,
			should_prorate_when_offer_ends: true,
		},
	},

	wp_titan_mail_monthly: {
		product_id: 400,
		product_name: 'Professional Email',
		product_slug: 'wp_titan_mail_monthly',
		description: '',
		product_type: '',
		available: true,
		billing_product_slug: 'titan-mail',
		is_domain_registration: false,
		cost_display: '$3.50',
		combined_cost_display: '$3.50',
		cost: 3.5,
		cost_smallest_unit: 350,
		currency_code: 'USD',
		price_tier_list: [],
		price_tier_usage_quantity: null,
		product_term: 'month',
		price_tiers: [],
		price_tier_slug: '',
		introductory_offer: {
			interval_unit: 'month',
			interval_count: 3,
			usage_limit: null,
			cost_per_interval: 0,
			transition_after_renewal_count: 0,
			should_prorate_when_offer_ends: false,
		},
	},
};

const card: StoredPaymentMethodCard = {
	stored_details_id: '1234',
	user_id: '5432',
	name: 'Card Person',
	country_code: 'US',
	payment_partner: 'stripe',
	payment_partner_reference: '',
	payment_partner_source_id: '',
	mp_ref: 'mock-mp-ref-1',
	email: '',
	card_expiry_year: '80',
	card_expiry_month: '01',
	expiry: '2080-01-31',
	remember: true,
	source: '',
	original_stored_details_id: '',
	is_rechargable: true,
	payment_type: '',
	is_expired: false,
	is_backup: false,
	tax_location: null,
	card_type: 'mastercard',
	card_iin: '',
	card_last_4: '4242',
	card_zip: '',
};

const userId = 1;
const siteId = 1;

function createTestReduxStore() {
	const initialState = getInitialState( initialReducer, userId );
	const reduxStore = createReduxStore(
		{
			...initialState,
			currentUser: { id: userId },
			sites: {
				items: {
					[ siteId ]: {
						ID: 1,
						URL: 'example.com',
						capabilities: {},
						description: 'something',
						domain: '',
						jetpack: false,
						launch_status: 'sure',
						locale: 'en',
						name: undefined,
						options: {},
						slug: 'example.com',
					},
				},
			},
		},
		initialReducer
	);
	setStore( reduxStore, getStateFromCache( userId ) );

	// Dispatch actions on the store to set `ui` and `purchases`. They cannot be
	// included in the initial state because the reducer does not support them
	// until we call `setStore()` to initialize support for dynamic reducers.
	reduxStore.dispatch( setSelectedSiteId( siteId ) );
	reduxStore.dispatch( {
		type: PURCHASES_SITE_FETCH_COMPLETED,
		siteId,
		purchases: [],
	} );

	return reduxStore;
}

describe( 'UpsellNudge', () => {
	const currentData = { cards: [] };

	beforeEach( () => {
		nock.cleanAll();
		window.scrollTo = jest.fn();
		currentData.cards = [ card ];
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/tax-contact-information/validate' )
			// TODO: we should make sure the right data is being passed here
			.reply( 200, () => ( { success: true } ) );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/products?type=all' )
			.reply( 200, () => mockProducts );
		Plans.useCurrentPlan.mockImplementation( () => ( {
			[ 'business-bundle' ]: mockDataStorePlans[ 'business-bundle' ],
		} ) );
		Plans.usePlans.mockImplementation( () => ( {
			data: {
				[ 'business-bundle' ]: mockDataStorePlans,
			},
		} ) );
		Plans.usePricingMetaForGridPlans.mockImplementation( () => ( {
			[ 'business-bundle' ]: {
				...mockDataStorePlans[ 'business-bundle' ].pricing,
				billingPeriod: mockDataStorePlans[ 'business-bundle' ].pricing.billPeriod,
			},
		} ) );
		ProductsList.useProducts.mockImplementation( () => ( { data: mockDataStoreProducts } ) );
	} );

	afterAll( () => {
		jest.clearAllMocks();
	} );

	it( 'displays the business plan purchase modal when a stored card is available', async () => {
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( new RegExp( '^/rest/v1.2/me/payment-methods' ) )
			.reply( 200, () => currentData.cards );
		const user = userEvent.setup();
		const queryClient = new QueryClient();
		const initialCart = getEmptyResponseCart();
		const mockCartFunctions = mockCartEndpoint( initialCart, 'USD', 'US' );
		const shoppingCartClient = createShoppingCartManagerClient( mockCartFunctions );
		mockGetSupportedCountriesEndpoint( mockCountries );

		render(
			<ReduxProvider store={ createTestReduxStore() }>
				<QueryClientProvider client={ queryClient }>
					<ShoppingCartProvider managerClient={ shoppingCartClient }>
						<UpsellNudge
							upsellType={ BUSINESS_PLAN_UPGRADE_UPSELL }
							upgradeItem="business"
							receiptId={ 12345 }
							siteSlugParam="example.com"
						/>
					</ShoppingCartProvider>
				</QueryClientProvider>
			</ReduxProvider>
		);

		await user.click( await screen.findByText( 'Upgrade Now' ) );
		expect(
			await screen.findByText( mockProducts[ 'business-bundle' ].product_name )
		).toBeInTheDocument();
		expect( await screen.findByText( card.name ) ).toBeInTheDocument();
		expect( await screen.findByText( `**** ${ card.card_last_4 }` ) ).toBeInTheDocument();
		expect( await screen.findByText( 'Pay $144' ) ).toBeInTheDocument();
	} );

	it( 'redirects to checkout for an business upsell when no stored cards are available', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( new RegExp( '^/rest/v1.2/me/payment-methods' ) )
			.reply( 200, () => [] );
		const user = userEvent.setup();
		const queryClient = new QueryClient();
		const initialCart = getEmptyResponseCart();
		const mockCartFunctions = mockCartEndpoint( initialCart, 'USD', 'US' );
		const shoppingCartClient = createShoppingCartManagerClient( mockCartFunctions );
		mockGetSupportedCountriesEndpoint( mockCountries );

		render(
			<ReduxProvider store={ createTestReduxStore() }>
				<QueryClientProvider client={ queryClient }>
					<ShoppingCartProvider managerClient={ shoppingCartClient }>
						<UpsellNudge
							upsellType={ BUSINESS_PLAN_UPGRADE_UPSELL }
							upgradeItem="business"
							receiptId={ 12345 }
							siteSlugParam="example.com"
						/>
					</ShoppingCartProvider>
				</QueryClientProvider>
			</ReduxProvider>
		);

		await user.click( await screen.findByText( 'Upgrade Now' ) );
		expect( screen.findByText( mockProducts[ 'business-bundle' ].product_name ) ).toNeverAppear();
		expect( page ).toHaveBeenCalledWith( `/checkout/business/example.com` );
	} );

	it( 'displays the email purchase modal when a stored card is available', async () => {
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( new RegExp( '^/rest/v1.2/me/payment-methods' ) )
			.reply( 200, () => currentData.cards );
		const user = userEvent.setup();
		const queryClient = new QueryClient();
		const initialCart = getEmptyResponseCart();
		const mockCartFunctions = mockCartEndpoint( initialCart, 'USD', 'US' );
		const shoppingCartClient = createShoppingCartManagerClient( mockCartFunctions );
		mockGetSupportedCountriesEndpoint( mockCountries );

		render(
			<ReduxProvider store={ createTestReduxStore() }>
				<QueryClientProvider client={ queryClient }>
					<ShoppingCartProvider managerClient={ shoppingCartClient }>
						<UpsellNudge
							upsellType={ PROFESSIONAL_EMAIL_UPSELL }
							upgradeItem="example.com"
							receiptId={ 12345 }
							siteSlugParam="example.com"
						/>
					</ShoppingCartProvider>
				</QueryClientProvider>
			</ReduxProvider>
		);

		await user.type( await screen.findByLabelText( /Enter email address/ ), 'testuser' );
		await user.type(
			await screen.findByLabelText( /Set password/ ),
			'aadjhaduhaidwahdawdhakjdbakdjbw'
		);
		await user.click( await screen.findByText( 'Add Professional Email' ) );
		expect(
			await screen.findByText( mockProducts[ 'wp_titan_mail_yearly' ].product_name )
		).toBeInTheDocument();
		expect( await screen.findByText( card.name ) ).toBeInTheDocument();
		expect( await screen.findByText( `**** ${ card.card_last_4 }` ) ).toBeInTheDocument();
		expect( await screen.findByText( 'Pay $3.50' ) ).toBeInTheDocument();
	} );

	it( 'redirects to checkout for an email upsell when no stored cards are available', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( new RegExp( '^/rest/v1.2/me/payment-methods' ) )
			.reply( 200, () => [] );
		const user = userEvent.setup();
		const queryClient = new QueryClient();
		const initialCart = getEmptyResponseCart();
		const mockCartFunctions = mockCartEndpoint( initialCart, 'USD', 'US' );
		const shoppingCartClient = createShoppingCartManagerClient( mockCartFunctions );
		mockGetSupportedCountriesEndpoint( mockCountries );

		render(
			<ReduxProvider store={ createTestReduxStore() }>
				<QueryClientProvider client={ queryClient }>
					<ShoppingCartProvider managerClient={ shoppingCartClient }>
						<UpsellNudge
							upsellType={ PROFESSIONAL_EMAIL_UPSELL }
							upgradeItem="example.com"
							receiptId={ 12345 }
							siteSlugParam="example.com"
						/>
					</ShoppingCartProvider>
				</QueryClientProvider>
			</ReduxProvider>
		);

		await user.type( await screen.findByLabelText( /Enter email address/ ), 'testuser' );
		await user.type(
			await screen.findByLabelText( /Set password/ ),
			'aadjhaduhaidwahdawdhakjdbakdjbw'
		);
		await user.click( await screen.findByText( 'Add Professional Email' ) );
		expect( screen.findByText( mockProducts.wp_titan_mail_monthly.product_name ) ).toNeverAppear();
		await waitFor( () => {
			expect( page ).toHaveBeenCalledWith( `/checkout/example.com` );
		} );

		expect(
			shoppingCartClient
				.forCartKey( siteId )
				.getState()
				.responseCart.products.some(
					( product ) => product.product_id === mockProducts.wp_titan_mail_monthly.product_id
				)
		).toBeTruthy();
	} );
} );
