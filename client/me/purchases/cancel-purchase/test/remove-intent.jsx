/**
 * @jest-environment jsdom
 */

import {
	purchaseCancelFeaturesQuery,
	purchaseQuery,
	sitePurchasesQuery,
} from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Provider as ReduxProvider } from 'react-redux';
import { useIsSplitCancelRemoveEnabled } from 'calypso/dashboard/me/billing-purchases/cancel-purchase/use-is-split-cancel-remove-enabled';
import { createReduxStore } from 'calypso/state';
import CancelPurchase from '../index';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { redirect: jest.fn() },
} ) );

jest.mock(
	'calypso/dashboard/me/billing-purchases/cancel-purchase/use-is-split-cancel-remove-enabled',
	() => ( {
		useIsSplitCancelRemoveEnabled: jest.fn( () => false ),
	} )
);

// A domain connection bundled with a plan: `expiry_status: 'included'` means it
// renews with the plan, so it is not "cancelable" — removal is the only action.
const bundledDomainConnection = {
	ID: '19823155',
	user_id: '56924323',
	blog_id: '212628935',
	product_id: '5',
	product_name: 'Domain Connection',
	product_slug: 'domain_map',
	product_type: 'domain_map',
	meta: 'onecooltestsite.com',
	domain: 'onecooltestsite.com',
	blogname: 'One Cool Test Site',
	subscribed_date: '2026-01-27T03:37:13+00:00',
	subscription_status: 'active',
	expiry_date: '2027-01-27T00:00:00+00:00',
	expiry_status: 'included',
	is_auto_renew_enabled: true,
	is_cancelable: false,
	is_refundable: false,
	is_removable: true,
	is_renewable: false,
	can_disable_auto_renew: false,
	amount: 13,
	currency_code: 'USD',
	currency_symbol: '$',
	refund_amount: 0,
	total_refund_amount: 0,
	bill_period_days: 365,
	included_domain: '',
	included_domain_purchase_amount: 0,
	attached_to_purchase_id: null,
	is_locked: false,
	price_tier_list: [],
};

function createStore( purchase ) {
	return createReduxStore(
		{
			currentUser: { id: Number( purchase.user_id ) },
			plans: { items: [] },
			purchases: {
				data: [ purchase ],
				hasLoadedUserPurchasesFromServer: true,
				hasLoadedSitePurchasesFromServer: true,
			},
			productsList: { items: {} },
			sites: {
				items: {
					[ purchase.blog_id ]: {
						ID: Number( purchase.blog_id ),
						URL: 'https://onecooltestsite.com',
						capabilities: {},
						options: {},
						slug: 'onecooltestsite.com',
					},
				},
				plans: {},
				requesting: {},
				domains: { requesting: {}, items: {} },
			},
			plugins: { premium: { plugins: {} } },
			ui: { selectSiteId: purchase.blog_id },
		},
		( state ) => state
	);
}

function renderCancelPurchase( purchase, intent ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { staleTime: Infinity, retry: false } },
	} );
	queryClient.setQueryData( purchaseCancelFeaturesQuery( Number( purchase.ID ) ).queryKey, {
		features: [],
	} );
	queryClient.setQueryData( purchaseQuery( Number( purchase.ID ) ).queryKey, purchase );
	queryClient.setQueryData( sitePurchasesQuery( Number( purchase.blog_id ) ).queryKey, [
		purchase,
	] );

	return render(
		<QueryClientProvider client={ queryClient }>
			<ReduxProvider store={ createStore( purchase ) }>
				<CancelPurchase
					purchaseId={ Number( purchase.ID ) }
					siteSlug="onecooltestsite.com"
					intent={ intent }
				/>
			</ReduxProvider>
		</QueryClientProvider>
	);
}

describe( 'CancelPurchase with intent=remove', () => {
	beforeEach( () => {
		page.redirect.mockClear();
		useIsSplitCancelRemoveEnabled.mockReturnValue( false );
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	it( 'renders the removal confirmation for a purchase that cannot be cancelled', async () => {
		renderCancelPurchase( bundledDomainConnection, 'remove' );

		expect( await screen.findByText( 'Remove upgrade' ) ).toBeVisible();
		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	it( 'removes the purchase rather than disabling auto-renew', async () => {
		const deleteRequest = nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/upgrades/19823155/delete' )
			.reply( 200, {} );
		const disableAutoRenewRequest = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/upgrades/19823155/disable-auto-renew' )
			.reply( 200, { success: true } );

		renderCancelPurchase( bundledDomainConnection, 'remove' );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Continue removal' } ) );
		await userEvent.click( await screen.findByRole( 'button', { name: 'Complete removal' } ) );

		// The removal is fired after a short delay so the button stays busy.
		await waitFor( () => expect( deleteRequest.isDone() ).toBe( true ), { timeout: 4000 } );
		expect( disableAutoRenewRequest.isDone() ).toBe( false );
	} );
} );
