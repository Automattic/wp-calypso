/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DeleteSite from '../index';

const initialState = {
	sites: {
		items: [
			{},
			{
				URL: 'test.com',
			},
		],
		requesting: {},
		plans: {},
	},
	ui: {
		selectedSiteId: 1,
	},
	currentUser: {
		id: 12,
		user: {
			email_verified: true,
		},
	},
	notices: {
		items: [],
	},
	purchases: {
		hasLoadedSitePurchasesFromServer: true,
		data: [],
	},
};

const mockDeleteSite = jest.fn();

jest.mock( 'calypso/components/data/query-site-purchases', () => {
	return () => {};
} );
jest.mock( 'calypso/components/inline-support-link', () => {
	return () => {
		<>InlineSupportLink</>;
	};
} );

describe( 'index', () => {
	jest.mock( 'calypso/state/sites/actions', () => {
		return {
			deleteSite: mockDeleteSite,
		};
	} );

	test( 'Check DeleteSite renders as expected', async () => {
		const mockStore = configureStore();
		const store = mockStore( initialState );
		const queryClient = new QueryClient();

		render(
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>
					<DeleteSite context="profile" siteCount={ 1 } />
				</QueryClientProvider>
			</Provider>
		);

		expect(
			screen.getByText( 'irreversible and will permanently remove all site content' )
		).toBeInTheDocument();
	} );

	test( 'Check will delete a site if the typed domain it the current one', async () => {
		const mockStore = configureStore();
		const store = mockStore( initialState );
		const queryClient = new QueryClient();

		render(
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>
					<DeleteSite context="profile" siteCount={ 1 } />
				</QueryClientProvider>
			</Provider>
		);

		fireEvent.change( screen.getByRole( 'textbox' ), {
			target: { value: 'test.com' },
		} );

		const deleteButton = await screen.getByRole( 'button', { name: /Delete site/ } );
		expect( deleteButton ).not.toBeDisabled();
		expect( mockDeleteSite ).not.toHaveBeenCalled();
	} );

	test( 'Check will show purchases message', async () => {
		const mockStore = configureStore();
		const storeData = initialState;
		storeData.purchases.data = [
			{
				blog_id: 1,
				active: true,
				is_refundable: true,
			},
		];
		const store = mockStore( storeData );
		const queryClient = new QueryClient();

		const { container } = render(
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>
					<DeleteSite context="profile" siteCount={ 1 } />
				</QueryClientProvider>
			</Provider>
		);

		expect( container.innerHTML ).toContain( 'You have active paid upgrades on your site' );
	} );
} );
