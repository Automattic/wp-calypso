/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import nock from 'nock';
import { Provider as ReduxProvider } from 'react-redux';
import { stripeConfiguration, mockStripeElements } from 'calypso/my-sites/checkout/src/test/util';
import { createReduxStore } from 'calypso/state';
import { PURCHASES_SITE_FETCH_COMPLETED } from 'calypso/state/action-types';
import { getInitialState, getStateFromCache } from 'calypso/state/initial-state';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import ChangePaymentMethod from '../change-payment-method';
import type { StoredPaymentMethod } from '../../../../lib/checkout/payment-methods';

jest.mock( '@stripe/react-stripe-js', () => {
	const stripe = jest.requireActual( '@stripe/react-stripe-js' );

	return {
		...stripe,
		...mockStripeElements(),
	};
} );

jest.mock( '@stripe/stripe-js', () => {
	return {
		loadStripe: async () => mockStripeElements().useStripe(),
	};
} );

// `recordPageView()` calls `fetch` for analytics with no guards and it is not
// available outside of a browser so we must mock it here to avoid fatals.
global.fetch = jest.fn( () => Promise.resolve() ) as any;

const userId = 1;
const siteId = 1;

const storedCard1: Partial< StoredPaymentMethod > = {
	card_last_4: '4242',
	card_type: 'visa',
	email: '',
	expiry: '2033-11-30',
	is_expired: false,
	mp_ref: '12345abcd',
	name: 'Human Person',
	payment_partner: 'stripe',
	remember: true,
	stored_details_id: '1',
	user_id: String( userId ),
};

const initialPurchases = [
	{
		ID: 1,
		active: true,
		amount: 100,
		attached_to_purchase_id: 0,
		bill_period_days: 365,
		bill_period_label: 'yearly',
		most_recent_renew_date: '',
		can_disable_auto_renew: true,
		can_reenable_auto_renewal: true,
		async_pending_payment_block_is_set: false,
		can_explicit_renew: true,
		cost_to_unbundle: undefined,
		cost_to_unbundle_display: undefined,
		price_text: '$100',
		currency_code: 'USD',
		currency_symbol: '$',
		description: 'something here',
		domain: '',
		domain_registration_agreement_url: undefined,
		blog_created_date: '2021-01-01',
		expiry_date: '3040-01-01',
		expiry_status: 'not-expired',
		iap_purchase_management_link: null,
		included_domain: '',
		included_domain_purchase_amount: 0,
		introductory_offer: null,
		is_cancelable: true,
		is_domain_registration: false,
		is_locked: false,
		is_iap_purchase: false,
		is_rechargable: false,
		is_refundable: false,
		is_renewable: false,
		is_renewal: false,
		meta: undefined,
		partner_name: undefined,
		partner_slug: undefined,
		partner_key_id: undefined,
		payment_name: 'who knows',
		payment_type: 'credit_card',
		payment_country_name: 'United States',
		payment_country_code: 'US',
		stored_details_id: 1,
		pending_transfer: false,
		product_id: 1,
		product_name: 'Personal',
		product_slug: 'personal-bundle',
		product_type: 'bundle',
		product_display_price: '$100',
		price_integer: 10000,
		total_refund_amount: 0,
		total_refund_text: '0',
		refund_amount: 0,
		refund_text: '0',
		refund_currency_symbol: '$',
		refund_options: null,
		refund_period_in_days: 31,
		regular_price_text: '$100',
		regular_price_integer: 10000,
		renew_date: '2023-01-01',
		sale_amount: undefined,
		sale_amount_integer: undefined,
		blog_id: 1,
		blogname: 'example.com',
		subscribed_date: '2021-01-01',
		subscription_status: 'active',
		tag_line: '',
		tax_amount: undefined,
		tax_text: undefined,
		renewal_price_tier_usage_quantity: undefined,
		user_id: 1,
		auto_renew: '1',
		payment_card_id: 1,
		payment_card_type: 'visa',
		payment_card_processor: 'stripe',
		payment_details: '4242',
		payment_expiry: '02/45',
	},
];

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
		purchases: initialPurchases,
	} );

	return reduxStore;
}

describe( 'ChangePaymentMethod', () => {
	it( 'renders a list of existing cards', async () => {
		const queryClient = new QueryClient();

		const paymentMethods: Partial< StoredPaymentMethod >[] = [ storedCard1 ];
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/me/payment-methods?type=card&expired=exclude' )
			.reply( 200, paymentMethods );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/stripe-configuration' )
			.reply( 200, stripeConfiguration );

		render(
			<ReduxProvider store={ createTestReduxStore() }>
				<QueryClientProvider client={ queryClient }>
					<ChangePaymentMethod
						getManagePurchaseUrlFor={ ( siteSlug: string, purchaseId: number ) =>
							`/manage-purchase-url/${ siteSlug }/${ purchaseId }`
						}
						purchaseId={ 1 }
						purchaseListUrl="purchase-list-url"
						siteSlug="example.com"
					/>
				</QueryClientProvider>
			</ReduxProvider>
		);

		expect( await screen.findByLabelText( new RegExp( storedCard1.name ) ) ).toBeInTheDocument();
	} );

	it( 'renders a new credit card payment method that reads "Credit or debit card"', async () => {
		const queryClient = new QueryClient();

		const paymentMethods: Partial< StoredPaymentMethod >[] = [ storedCard1 ];
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/me/payment-methods?type=card&expired=exclude' )
			.reply( 200, paymentMethods );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/stripe-configuration' )
			.reply( 200, stripeConfiguration );

		render(
			<ReduxProvider store={ createTestReduxStore() }>
				<QueryClientProvider client={ queryClient }>
					<ChangePaymentMethod
						getManagePurchaseUrlFor={ ( siteSlug: string, purchaseId: number ) =>
							`/manage-purchase-url/${ siteSlug }/${ purchaseId }`
						}
						purchaseId={ 1 }
						purchaseListUrl="purchase-list-url"
						siteSlug="example.com"
					/>
				</QueryClientProvider>
			</ReduxProvider>
		);

		expect( await screen.findByLabelText( 'New credit or debit card' ) ).toBeInTheDocument();
	} );

	it( 'renders a new credit card payment method that reads "New credit or debit card"', async () => {
		const queryClient = new QueryClient();

		const paymentMethods: Partial< StoredPaymentMethod >[] = [];

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/me/payment-methods?type=card&expired=exclude' )
			.reply( 200, paymentMethods );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/stripe-configuration' )
			.reply( 200, stripeConfiguration );

		render(
			<ReduxProvider store={ createTestReduxStore() }>
				<QueryClientProvider client={ queryClient }>
					<ChangePaymentMethod
						getManagePurchaseUrlFor={ ( siteSlug: string, purchaseId: number ) =>
							`/manage-purchase-url/${ siteSlug }/${ purchaseId }`
						}
						purchaseId={ 1 }
						purchaseListUrl="purchase-list-url"
						siteSlug="example.com"
					/>
				</QueryClientProvider>
			</ReduxProvider>
		);

		expect( await screen.findByLabelText( 'Credit or debit card' ) ).toBeInTheDocument();
	} );

	it( 'renders a PayPal payment method', async () => {
		const queryClient = new QueryClient();

		const paymentMethods: Partial< StoredPaymentMethod >[] = [ storedCard1 ];
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/me/payment-methods?type=card&expired=exclude' )
			.reply( 200, paymentMethods );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/stripe-configuration' )
			.reply( 200, stripeConfiguration );

		render(
			<ReduxProvider store={ createTestReduxStore() }>
				<QueryClientProvider client={ queryClient }>
					<ChangePaymentMethod
						getManagePurchaseUrlFor={ ( siteSlug: string, purchaseId: number ) =>
							`/manage-purchase-url/${ siteSlug }/${ purchaseId }`
						}
						purchaseId={ 1 }
						purchaseListUrl="purchase-list-url"
						siteSlug="example.com"
					/>
				</QueryClientProvider>
			</ReduxProvider>
		);

		expect( await screen.findByLabelText( 'PayPal' ) ).toBeInTheDocument();
	} );
} );
