/**
 * @jest-environment jsdom
 */

import {
	createShoppingCartManagerClient,
	getEmptyResponseCart,
	ShoppingCartProvider,
} from '@automattic/shopping-cart';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { mockCartEndpoint } from 'calypso/my-sites/checkout/composite-checkout/test/util';
import { createReduxStore } from 'calypso/state';
import {
	PURCHASES_SITE_FETCH_COMPLETED,
	COUNTRIES_PAYMENTS_UPDATED,
} from 'calypso/state/action-types';
import { getInitialState, getStateFromCache } from 'calypso/state/initial-state';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import UpsellNudge, { BUSINESS_PLAN_UPGRADE_UPSELL } from '../index';
import type { StoredPaymentMethodCard } from '../../../../lib/checkout/payment-methods';

const mockCountries = [ { code: 'US', has_postal_codes: true, name: 'United States' } ];

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
	reduxStore.dispatch( {
		type: COUNTRIES_PAYMENTS_UPDATED,
		countries: mockCountries,
	} );

	return reduxStore;
}

describe( 'UpsellNudge', () => {
	const currentData = { cards: [] };

	beforeEach( () => {
		nock.cleanAll();
		currentData.cards = [ card ];
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( new RegExp( '^/rest/v1.2/me/payment-methods' ) )
			.reply( 200, () => currentData.cards );
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/tax-contact-information/validate' )
			// TODO: we should make sure the right data is being passed here
			.reply( 200, () => ( { success: true } ) );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/products?type=all' )
			.reply( 200, () => mockProducts );
	} );

	it( 'displays the purchase modal when a stored card is available', async () => {
		const user = userEvent.setup();
		const queryClient = new QueryClient();
		const initialCart = getEmptyResponseCart();
		const mockCartFunctions = mockCartEndpoint( initialCart, 'USD', 'US' );
		const shoppingCartClient = createShoppingCartManagerClient( mockCartFunctions );

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
} );
