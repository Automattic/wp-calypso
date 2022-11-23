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
} );
