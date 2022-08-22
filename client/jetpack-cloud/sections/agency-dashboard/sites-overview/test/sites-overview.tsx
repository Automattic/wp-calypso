/**
 * @jest-environment jsdom
 */

import { render, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import SitesOverviewContext from '../context';
import SitesOverview from '../index';

describe( '<SitesOverview>', () => {
	const initialState = {
		sites: {},
		partnerPortal: { partner: {} },
		agencyDashboard: {},
		ui: {},
		documentHead: {},
		currentUser: {
			capabilities: {},
		},
	};
	const middlewares = [ thunk ];

	const mockStore = configureStore( middlewares );
	const store = mockStore( initialState );

	const context = {
		currentPage: 1,
		search: '',
		filter: { issueTypes: [], showOnlyFavorites: false },
	};

	const queryClient = new QueryClient();

	const Wrapper = ( { context } ): JSX.Element => (
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<SitesOverviewContext.Provider value={ context }>
					<SitesOverview />
				</SitesOverviewContext.Provider>
			</QueryClientProvider>
		</Provider>
	);

	const setData = (): void => {
		const data = {
			sites: [],
			total: 1,
			perPage: 1,
			totalFavorites: 1,
		};
		const queryKey = [ 'jetpack-agency-dashboard-sites', context.search, 1, context.filter ];
		queryClient.setQueryData( queryKey, data );
	};

	test( 'Show the correct empty state message when there are no sites and no applied filters in All tab', async () => {
		setData();

		const { getAllByText } = render( <Wrapper context={ context } /> );
		const [ dashboardHeading ] = getAllByText( 'Dashboard' );
		expect( dashboardHeading ).toBeInTheDocument();

		const [ dashboardSubHeading ] = getAllByText(
			'Manage all your Jetpack sites from one location'
		);
		expect( dashboardSubHeading ).toBeInTheDocument();

		const [ emptyStateMessage ] = getAllByText( 'No active sites' );
		expect( emptyStateMessage ).toBeInTheDocument();

		const promise = Promise.resolve();
		await act( () => promise );
	} );

	test( 'Show the correct empty state message when there are no sites and has applied filters in All tab', async () => {
		context.search = 'test';
		setData();

		const { getAllByText } = render( <Wrapper context={ context } /> );

		const [ emptyStateMessage ] = getAllByText(
			'No results found. Please try refining your search.'
		);
		expect( emptyStateMessage ).toBeInTheDocument();

		const promise = Promise.resolve();
		await act( () => promise );
	} );

	test( 'Show the correct empty state message when there are no sites and has applied filters in Favorites tab', async () => {
		context.filter.showOnlyFavorites = true;
		setData();

		const { getAllByText } = render( <Wrapper context={ context } /> );

		const [ emptyStateMessage ] = getAllByText(
			'No results found. Please try refining your search.'
		);
		expect( emptyStateMessage ).toBeInTheDocument();

		const promise = Promise.resolve();
		await act( () => promise );
	} );

	test( 'Show the correct empty state message when there are no sites and no applied filters in Favorites tab', async () => {
		context.search = '';
		context.filter.showOnlyFavorites = true;
		setData();

		const { getAllByText } = render( <Wrapper context={ context } /> );

		const [ emptyStateMessage ] = getAllByText( "You don't have any favorites yet." );
		expect( emptyStateMessage ).toBeInTheDocument();

		const promise = Promise.resolve();
		await act( () => promise );
	} );
} );
