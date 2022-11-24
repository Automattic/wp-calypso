/**
 * @jest-environment jsdom
 */

/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/valid-title */

import { render, screen } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import PurchaseMeta from '../purchase-meta';

describe( 'PurchaseMeta', () => {
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
			<ReduxProvider store={ store }>
				<PurchaseMeta
					hasLoadedPurchasesFromServer={ true }
					purchaseId={ 1 }
					siteSlug="test"
					isDataLoading={ false }
				/>
			</ReduxProvider>
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
			<ReduxProvider store={ store }>
				<PurchaseMeta
					hasLoadedPurchasesFromServer={ true }
					purchaseId={ 1 }
					siteSlug="test"
					isDataLoading={ false }
				/>
			</ReduxProvider>
		);
		expect( screen.getByText( /year/ ) ).toBeInTheDocument();
	} );

	it( 'does render "/ month" in the price column when it is a yearly purchase', () => {
		const store = createReduxStore(
			{
				purchases: {
					data: [
						{
							ID: 1,
							bill_period_label: 'per month',
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
		expect( screen.getByText( /month/ ) ).toBeInTheDocument();
	} );

	it( 'does render "/ week" in the price column when it is a yearly purchase', () => {
		const store = createReduxStore(
			{
				purchases: {
					data: [
						{
							ID: 1,
							bill_period_label: 'per week',
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
		expect( screen.getByText( /week/ ) ).toBeInTheDocument();
	} );

	it( 'does render "/ day" in the price column when it is a daily purchase', () => {
		const store = createReduxStore(
			{
				purchases: {
					data: [
						{
							ID: 1,
							bill_period_label: 'per day',
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
		expect( screen.getByText( /day/ ) ).toBeInTheDocument();
	} );

	it( 'does render "two years" in the price column when it is a bi-annual purchase', () => {
		const store = createReduxStore(
			{
				purchases: {
					data: [
						{
							ID: 1,
							product_slug: 'business-bundle-2y',
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

		expect( screen.getByText( /two years/ ) ).toBeInTheDocument();
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
			<ReduxProvider store={ store }>
				<PurchaseMeta
					hasLoadedPurchasesFromServer={ true }
					purchaseId={ 1 }
					siteSlug="test"
					isDataLoading={ false }
				/>
			</ReduxProvider>
		);

		//screen.debug();
		expect( screen.getByText( /Never Expires/ ) ).toBeInTheDocument();
	} );
} );
