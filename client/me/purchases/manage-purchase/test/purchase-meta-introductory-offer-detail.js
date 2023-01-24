/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import PurchaseMeta from '../purchase-meta';

describe( 'PurchaseMetaIntroductoryOfferDetail', () => {
	it( 'does render "First 3 months free"', () => {
		const store = createReduxStore(
			{
				purchases: {
					data: [
						{
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
								is_next_renewal_prorated: true,
								is_next_renewal_using_offer: false,
								is_within_period: true,
								remaining_renewals_using_offer: 0,
								should_prorate_when_offer_ends: true,
								transition_after_renewal_count: 0,
							},
							regular_price_text: '$35',
							regular_price_integer: 3500,
						},
					],
				},
				sites: {
					requestingAll: false,
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
		render(
			<ReduxProvider store={ store }>
				<PurchaseMeta
					hasLoadedPurchasesFromServer={ true }
					purchaseId={ 1 }
					siteSlug="test"
					isDataLoading={ false }
				/>
			</ReduxProvider>
		);
		expect( screen.getByText( /First 3 months free\b/ ) ).toBeInTheDocument();
		expect(
			screen.getByText( /After the first renewal, the subscription price will be \$35\b/ )
		).toBeInTheDocument();
	} );
} );
