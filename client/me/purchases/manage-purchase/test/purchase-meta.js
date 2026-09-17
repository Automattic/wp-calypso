/**
 * @jest-environment jsdom
 */

import { purchaseQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import PurchaseMeta from '../purchase-meta';

describe( 'PurchaseMeta', () => {
	const commonStoreAttributes = {
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
	};

	function renderPurchaseMeta( purchase ) {
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { staleTime: Infinity, retry: false } },
		} );
		queryClient.setQueryData( purchaseQuery( purchase.ID ).queryKey, purchase );
		const store = createReduxStore( { ...commonStoreAttributes }, ( state ) => state );
		return render(
			<QueryClientProvider client={ queryClient }>
				<ReduxProvider store={ store }>
					<PurchaseMeta purchaseId={ purchase.ID } siteSlug="test" />
				</ReduxProvider>
			</QueryClientProvider>
		);
	}

	it( 'does render "Free with Plan"', () => {
		renderPurchaseMeta( { ID: 1, expiry_status: 'included' } );
		expect( screen.getByText( /Free with Plan/ ) ).toBeInTheDocument();
	} );

	it( 'does render "/ year" in the price column when it is a yearly purchase', () => {
		renderPurchaseMeta( { ID: 1, bill_period_days: 365, bill_period_label: 'per year' } );
		expect( screen.getByText( /\/ year\b/ ) ).toBeInTheDocument();
	} );

	it( 'does render "/ year" in the price column when it is a yearly purchase in French', () => {
		renderPurchaseMeta( { ID: 1, bill_period_days: 365, bill_period_label: 'par année' } );
		expect( screen.getByText( /\/ year\b/ ) ).toBeInTheDocument();
	} );

	it( 'does render "/ month" in the price column when it is a yearly purchase', () => {
		renderPurchaseMeta( { ID: 1, bill_period_label: 'per month', bill_period_days: 31 } );
		expect( screen.getByText( /\/ month\b/ ) ).toBeInTheDocument();
	} );

	it( 'does render "/ week" in the price column when it is a yearly purchase', () => {
		renderPurchaseMeta( { ID: 1, bill_period_label: 'per week', bill_period_days: 7 } );
		expect( screen.getByText( /\/ week\b/ ) ).toBeInTheDocument();
	} );

	it( 'does render "/ day" in the price column when it is a daily purchase', () => {
		renderPurchaseMeta( { ID: 1, bill_period_label: 'per day', bill_period_days: 1 } );
		expect( screen.getByText( /\/ day\b/ ) ).toBeInTheDocument();
	} );

	it( 'does render "two years" in the price column when it is a bi-annual purchase', () => {
		renderPurchaseMeta( { ID: 1, product_slug: 'business-bundle-2y', bill_period_days: 730 } );
		expect( screen.getByText( /\/ two years\b/ ) ).toBeInTheDocument();
	} );

	it( 'does render "three years" in the price column when it is a triennial purchase', () => {
		renderPurchaseMeta( { ID: 1, product_slug: 'business-bundle-3y', bill_period_days: 1095 } );
		expect( screen.getByText( /\/ three years\b/ ) ).toBeInTheDocument();
	} );

	it( 'does render "Never Expires" in the Renews on column when it is a DIFM purchase', () => {
		renderPurchaseMeta( {
			ID: 1,
			product_slug: 'wp_difm_lite',
			expiry_status: 'one-time-purchase',
			subscription_status: 'active',
		} );
		expect( screen.getByText( /Never Expires/ ) ).toBeInTheDocument();
	} );

	it( 'does render auto renew coupon details in the price column when a auto renew coupon has been applied', () => {
		renderPurchaseMeta( {
			ID: 1,
			product_slug: 'business-bundle-3y',
			bill_period_days: 1095,
			auto_renew_coupon_code: 'test',
			auto_renew_coupon_discount_percentage: 10,
		} );
		expect(
			screen.getByText(
				'Coupon code "test" has been applied for the next renewal for a 10% discount.'
			)
		).toBeInTheDocument();
	} );
} );
