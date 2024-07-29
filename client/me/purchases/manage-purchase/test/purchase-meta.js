/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import PurchaseMeta from '../purchase-meta';

describe( 'PurchaseMeta', () => {
	const queryClient = new QueryClient();

	it( 'does render "Free with Plan"', () => {
		const store = createReduxStore(
			{
				purchases: {
					data: [
						{
							ID: 1,
							expiry_status: 'included',
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
			<QueryClientProvider client={ queryClient }>
				<ReduxProvider store={ store }>
					<PurchaseMeta
						hasLoadedPurchasesFromServer
						purchaseId={ 1 }
						siteSlug="test"
						isDataLoading={ false }
					/>
				</ReduxProvider>
			</QueryClientProvider>
		);
		expect( screen.getByText( /Free with Plan/ ) ).toBeInTheDocument();
	} );

	it( 'does render "/ year" in the price column when it is a yearly purchase', () => {
		const store = createReduxStore(
			{
				purchases: {
					data: [
						{
							ID: 1,
							bill_period_days: 365,
							bill_period_label: 'per year',
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
			<QueryClientProvider client={ queryClient }>
				<ReduxProvider store={ store }>
					<PurchaseMeta
						hasLoadedPurchasesFromServer
						purchaseId={ 1 }
						siteSlug="test"
						isDataLoading={ false }
					/>
				</ReduxProvider>
			</QueryClientProvider>
		);
		expect( screen.getByText( /\/ year\b/ ) ).toBeInTheDocument();
	} );

	it( 'does render "/ year" in the price column when it is a yearly purchase in French', () => {
		const store = createReduxStore(
			{
				purchases: {
					data: [
						{
							ID: 1,
							bill_period_days: 365,
							bill_period_label: 'par année',
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
			<QueryClientProvider client={ queryClient }>
				<ReduxProvider store={ store }>
					<PurchaseMeta
						hasLoadedPurchasesFromServer
						purchaseId={ 1 }
						siteSlug="test"
						isDataLoading={ false }
					/>
				</ReduxProvider>
			</QueryClientProvider>
		);
		expect( screen.getByText( /\/ year\b/ ) ).toBeInTheDocument();
	} );

	it( 'does render "/ month" in the price column when it is a yearly purchase', () => {
		const store = createReduxStore(
			{
				purchases: {
					data: [
						{
							ID: 1,
							bill_period_label: 'per month',
							bill_period_days: 31,
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
			<QueryClientProvider client={ queryClient }>
				<ReduxProvider store={ store }>
					<PurchaseMeta
						hasLoadedPurchasesFromServer
						purchaseId={ 1 }
						siteSlug="test"
						isDataLoading={ false }
					/>
				</ReduxProvider>
			</QueryClientProvider>
		);
		expect( screen.getByText( /\/ month\b/ ) ).toBeInTheDocument();
	} );

	it( 'does render "/ week" in the price column when it is a yearly purchase', () => {
		const store = createReduxStore(
			{
				purchases: {
					data: [
						{
							ID: 1,
							bill_period_label: 'per week',
							bill_period_days: 7,
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
			<QueryClientProvider client={ queryClient }>
				<ReduxProvider store={ store }>
					<PurchaseMeta
						hasLoadedPurchasesFromServer
						purchaseId={ 1 }
						siteSlug="test"
						isDataLoading={ false }
					/>
				</ReduxProvider>
			</QueryClientProvider>
		);
		expect( screen.getByText( /\/ week\b/ ) ).toBeInTheDocument();
	} );

	it( 'does render "/ day" in the price column when it is a daily purchase', () => {
		const store = createReduxStore(
			{
				purchases: {
					data: [
						{
							ID: 1,
							bill_period_label: 'per day',
							bill_period_days: 1,
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
			<QueryClientProvider client={ queryClient }>
				<ReduxProvider store={ store }>
					<PurchaseMeta
						hasLoadedPurchasesFromServer
						purchaseId={ 1 }
						siteSlug="test"
						isDataLoading={ false }
					/>
				</ReduxProvider>
			</QueryClientProvider>
		);
		expect( screen.getByText( /\/ day\b/ ) ).toBeInTheDocument();
	} );

	it( 'does render "two years" in the price column when it is a bi-annual purchase', () => {
		const store = createReduxStore(
			{
				purchases: {
					data: [
						{
							ID: 1,
							product_slug: 'business-bundle-2y',
							bill_period_days: 730,
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
			<QueryClientProvider client={ queryClient }>
				<ReduxProvider store={ store }>
					<PurchaseMeta
						hasLoadedPurchasesFromServer
						purchaseId={ 1 }
						siteSlug="test"
						isDataLoading={ false }
					/>
				</ReduxProvider>
			</QueryClientProvider>
		);

		expect( screen.getByText( /\/ two years\b/ ) ).toBeInTheDocument();
	} );

	it( 'does render "three years" in the price column when it is a triennial purchase', () => {
		const store = createReduxStore(
			{
				purchases: {
					data: [
						{
							ID: 1,
							product_slug: 'business-bundle-3y',
							bill_period_days: 1095,
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
			<QueryClientProvider client={ queryClient }>
				<ReduxProvider store={ store }>
					<PurchaseMeta
						hasLoadedPurchasesFromServer
						purchaseId={ 1 }
						siteSlug="test"
						isDataLoading={ false }
					/>
				</ReduxProvider>
			</QueryClientProvider>
		);

		expect( screen.getByText( /\/ three years\b/ ) ).toBeInTheDocument();
	} );

	it( 'does render "Never Expires" in the Renews on column when it is a DIFM purchase', () => {
		const store = createReduxStore(
			{
				purchases: {
					data: [
						{
							ID: 1,
							product_slug: 'wp_difm_lite',
							expiry_status: 'one_time_purchase',
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
			<QueryClientProvider client={ queryClient }>
				<ReduxProvider store={ store }>
					<PurchaseMeta
						hasLoadedPurchasesFromServer
						purchaseId={ 1 }
						siteSlug="test"
						isDataLoading={ false }
					/>
				</ReduxProvider>
			</QueryClientProvider>
		);

		expect( screen.getByText( /Never Expires/ ) ).toBeInTheDocument();
	} );

	it( 'does render auto renew coupon details in the price column when a auto renew coupon has been applied', () => {
		const store = createReduxStore(
			{
				purchases: {
					data: [
						{
							ID: 1,
							product_slug: 'business-bundle-3y',
							bill_period_days: 1095,
							auto_renew_coupon_code: 'test',
							auto_renew_coupon_discount_percentage: 10,
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
			<QueryClientProvider client={ queryClient }>
				<ReduxProvider store={ store }>
					<PurchaseMeta
						hasLoadedPurchasesFromServer
						purchaseId={ 1 }
						siteSlug="test"
						isDataLoading={ false }
					/>
				</ReduxProvider>
			</QueryClientProvider>
		);

		expect(
			screen.getByText(
				'Coupon code "test" has been applied for the next renewal for a 10% discount.'
			)
		).toBeInTheDocument();
	} );
} );
