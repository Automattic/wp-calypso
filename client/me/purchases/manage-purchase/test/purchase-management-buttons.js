/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import nock from 'nock';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import ManagePurchase from '../index.jsx';

const purchase = {
	ID: '19823155',
	user_id: '56924323',
	blog_id: '212628935',
	product_id: '1008',
	subscribed_date: '2022-11-27T03:37:13+00:00',
	renew: '1',
	auto_renew: '1',
	renew_date: '',
	active: '1',
	meta: '',
	ownership_id: '36454407',
	most_recent_renew_date: '2022-11-27T03:37:14+00:00',
	subscription_status: 'active',
	payment_type: 'credits',
	product_name: 'WordPress.com Business',
	product_slug: 'business-bundle',
	product_type: 'bundle',
	blog_created_date: '2022-11-21T05:50:39+00:00',
	blogname: '',
	domain: 'onecooltestsite.com',
	description:
		'<p>All the benefits of our Premium plan, plus the ability to: </p><ul><li>Try any one of our 200+ themes and change as often as you like, no extra charge.</li><li>Upload all the video and audio files you want with unlimited storage.</li><li>Chat live with a WordPress.com specialist Monday to Friday between 7am and 7pm Eastern time.</li></ul><p>See the <a href="http://store.wordpress.com/premium-upgrades/wordpress-business/">WordPress.com Business</a> page for more information.</p>',
	attached_to_purchase_id: null,
	included_domain: '',
	included_domain_purchase_amount: 0,
	amount: 300,
	currency_code: 'USD',
	currency_symbol: '$',
	renewal_price_tier_slug: null,
	renewal_price_tier_usage_quantity: null,
	current_price_tier_slug: null,
	current_price_tier_usage_quantity: null,
	price_tier_list: [],
	expiry_date: '2023-11-27T00:00:00+00:00',
	expiry_message: 'Expires on November 27, 2023',
	expiry_sub_message: null,
	expiry_status: 'manual-renew',
	price_text: '$300',
	bill_period_label: 'per year',
	bill_period_days: 365,
	regular_price_text: '$300',
	product_display_price: '<abbr title="United States Dollars">$</abbr>300',
	is_cancelable: false,
	can_explicit_renew: true,
	can_disable_auto_renew: false,
	can_reenable_auto_renewal: false,
	iap_purchase_management_link: null,
	is_iap_purchase: false,
	is_locked: false,
	is_refundable: false,
	refund_period_in_days: 14,
	is_renewable: true,
	is_renewal: false,
	has_private_registration: false,
	refund_amount: 0,
	refund_currency_symbol: '$',
	refund_text: '$0',
	refund_options: null,
	total_refund_amount: 0,
	total_refund_text: '$0',
	check_dns: false,
};

describe( 'Purchase Management Buttons', () => {
	it( 'renders a cancel button when auto-renew is ON', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/payment-methods?expired=include' )
			.reply( 200 );

		const store = createReduxStore(
			{
				currentUser: { id: Number( purchase.user_id ) },
				happychat: { chat: { status: '' } },
				plans: { items: [] },
				purchases: {
					data: [ { ...purchase, auto_renew: 1 } ],
					hasLoadedUserPurchasesFromServer: true,
					hasLoadedSitePurchasesFromServer: true,
				},
				productsList: { items: {} },
				sites: {
					items: { 212628935: { ID: 212628935 } },
					plans: {},
					requesting: {},
					domains: { requesting: {}, items: { [ purchase.site_id ]: {} } },
				},
				plugins: {
					premium: { plugins: {} },
				},
				ui: { selectSiteId: purchase.site_id },
			},
			( state ) => {
				return state;
			}
		);

		render(
			<ReduxProvider store={ store }>
				<ManagePurchase
					purchaseId={ Number( purchase.ID ) }
					isSiteLevel
					siteSlug="onecooltestsite.com"
				/>
			</ReduxProvider>
		);
		expect( await screen.findByText( /Cancel/ ) ).toBeInTheDocument();
	} );

	it( 'renders a remove button when auto-renew is OFF', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/payment-methods?expired=include' )
			.reply( 200 );

		const store = createReduxStore(
			{
				currentUser: { id: Number( purchase.user_id ) },
				happychat: { chat: { status: '' } },
				plans: { items: [] },
				purchases: {
					data: [ { ...purchase, auto_renew: 0 } ],
					hasLoadedUserPurchasesFromServer: true,
					hasLoadedSitePurchasesFromServer: true,
				},
				productsList: { items: {} },
				sites: {
					items: { 212628935: { ID: 212628935 } },
					plans: {},
					requesting: {},
					domains: { requesting: {}, items: { [ purchase.site_id ]: {} } },
				},
				plugins: {
					premium: { plugins: {} },
				},
				ui: { selectSiteId: purchase.site_id },
			},
			( state ) => {
				return state;
			}
		);

		render(
			<ReduxProvider store={ store }>
				<ManagePurchase
					purchaseId={ Number( purchase.ID ) }
					isSiteLevel
					siteSlug="onecooltestsite.com"
				/>
			</ReduxProvider>
		);
		expect( await screen.findByText( /Remove/ ) ).toBeInTheDocument();
	} );
} );
