/**
 * @jest-environment jsdom
 */

import { purchaseQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import PurchaseMeta from '../purchase-meta';

const basicPurchase = {
	ID: 1,
	bill_period_label: 'per year',
	bill_period_days: 365,
	amount: 26.37,
	price_integer: 2637,
	currency_code: 'USD',
	currency_symbol: '$',
	expiry_date: '2023-03-02T00:00:00+00:00',
	expiry_status: 'expiring',
	introductory_offer: {
		cost_per_interval: 0,
		end_date: '2023-03-02T00:00:00+00:00',
		interval_count: 3,
		interval_unit: 'month',
		is_next_renewal_prorated: false,
		is_next_renewal_using_offer: false,
		is_within_period: true,
		remaining_renewals_using_offer: 0,
		should_prorate_when_offer_ends: false,
		transition_after_renewal_count: 0,
	},
	regular_price_text: '$35',
	regular_price_integer: 3500,
};

function renderWithPurchase( purchase ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { staleTime: Infinity, retry: false } },
	} );
	queryClient.setQueryData( purchaseQuery( purchase.ID ).queryKey, purchase );
	const store = createReduxStore(
		{
			sites: {
				requestingAll: false,
				domains: {
					items: [],
				},
			},
			currentUser: {
				id: 1,
				user: {
					primary_blog: 'example',
				},
			},
		},
		( state ) => state
	);
	return render(
		<QueryClientProvider client={ queryClient }>
			<ReduxProvider store={ store }>
				<PurchaseMeta purchaseId={ purchase.ID } siteSlug="test" />
			</ReduxProvider>
		</QueryClientProvider>
	);
}

describe( 'PurchaseMetaIntroductoryOfferDetail', () => {
	it( 'renders "after first renewal" text yearly for an intro offer with prorated renewal where next renewal is not using offer', () => {
		const purchase = {
			...basicPurchase,
			introductory_offer: {
				...basicPurchase.introductory_offer,
				is_next_renewal_prorated: true,
				is_next_renewal_using_offer: false,
			},
		};
		renderWithPurchase( purchase );
		expect(
			screen.getByText( 'After the first renewal, the subscription price will be $35 / year' )
		).toBeInTheDocument();
	} );

	it( 'renders "after first renewal" text monthly for an intro offer with prorated renewal where next renewal is not using offer', () => {
		const purchase = {
			...basicPurchase,
			bill_period_days: 31,
			introductory_offer: {
				...basicPurchase.introductory_offer,
				is_next_renewal_prorated: true,
				is_next_renewal_using_offer: false,
			},
		};
		renderWithPurchase( purchase );
		expect(
			screen.getByText( 'After the first renewal, the subscription price will be $35 / month' )
		).toBeInTheDocument();
	} );

	it( 'renders "after first renewal" text without period for an intro offer with prorated renewal where next renewal is not using offer', () => {
		const purchase = {
			...basicPurchase,
			bill_period_days: 7, // A bill period not covered by the code.
			introductory_offer: {
				...basicPurchase.introductory_offer,
				is_next_renewal_prorated: true,
				is_next_renewal_using_offer: false,
			},
		};
		renderWithPurchase( purchase );
		expect(
			screen.getByText( 'After the first renewal, the subscription price will be $35' )
		).toBeInTheDocument();
	} );

	it( 'renders no text for an intro offer without prorated renewal where next renewal is not using offer', () => {
		const purchase = {
			...basicPurchase,
			introductory_offer: {
				...basicPurchase.introductory_offer,
				is_next_renewal_prorated: false,
				is_next_renewal_using_offer: false,
			},
		};
		renderWithPurchase( purchase );
		expect( screen.queryByText( /After the first renewal/ ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /After the offer ends/ ) ).not.toBeInTheDocument();
	} );

	it( 'renders "after offer ends" text yearly for an intro offer without prorated renewal where next renewal is using offer', () => {
		const purchase = {
			...basicPurchase,
			introductory_offer: {
				...basicPurchase.introductory_offer,
				is_next_renewal_prorated: false,
				is_next_renewal_using_offer: true,
			},
		};
		renderWithPurchase( purchase );
		expect(
			screen.getByText( 'After the offer ends, the subscription price will be $35 / year' )
		).toBeInTheDocument();
	} );

	it( 'renders "after offer ends" text monthly for an intro offer without prorated renewal where next renewal is using offer', () => {
		const purchase = {
			...basicPurchase,
			bill_period_days: 31,
			introductory_offer: {
				...basicPurchase.introductory_offer,
				is_next_renewal_prorated: false,
				is_next_renewal_using_offer: true,
			},
		};
		renderWithPurchase( purchase );
		expect(
			screen.getByText( 'After the offer ends, the subscription price will be $35 / month' )
		).toBeInTheDocument();
	} );

	it( 'renders "after offer ends" text without period for an intro offer without prorated renewal where next renewal is using offer', () => {
		const purchase = {
			...basicPurchase,
			bill_period_days: 7, // A bill period not covered by the code.
			introductory_offer: {
				...basicPurchase.introductory_offer,
				is_next_renewal_prorated: false,
				is_next_renewal_using_offer: true,
			},
		};
		renderWithPurchase( purchase );
		expect(
			screen.getByText( 'After the offer ends, the subscription price will be $35' )
		).toBeInTheDocument();
	} );

	it( 'renders "after offer ends" text without period for an intro offer with prorated renewal where next renewal is using offer', () => {
		const purchase = {
			...basicPurchase,
			bill_period_days: 7, // A bill period not covered by the code.
			introductory_offer: {
				...basicPurchase.introductory_offer,
				is_next_renewal_prorated: true,
				is_next_renewal_using_offer: true,
			},
		};
		renderWithPurchase( purchase );
		expect(
			screen.getByText( 'After the offer ends, the subscription price will be $35' )
		).toBeInTheDocument();
	} );
} );
