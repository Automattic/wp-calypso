/**
 * @jest-environment jsdom
 */

import { isWithinBreakpoint } from '@automattic/viewport';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, act } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import SitesOverviewContext from '../context';
import SitesOverview from '../index';

jest.mock( '@automattic/viewport' );

const mockedIsWithinBreakpoint = isWithinBreakpoint as jest.MockedFunction<
	typeof isWithinBreakpoint
>;

window.IntersectionObserver = jest.fn( () => ( {
	observe: jest.fn(),
	disconnect: jest.fn(),
	root: null,
	rootMargin: '',
	thresholds: [],
	takeRecords: jest.fn(),
	unobserve: jest.fn(),
} ) );

describe( '<SitesOverview>', () => {
	const initialState = {
		sites: {},
		partnerPortal: { partner: {} },
		agencyDashboard: {
			selectedLicenses: {
				licenses: [ '' ],
			},
		},
		ui: {},
		documentHead: {},
		currentUser: {
			capabilities: {},
		},
		productsList: {
			isFetching: false,
		},
	};
	const middlewares = [ thunk ];

	const mockStore = configureStore( middlewares );
	const store = mockStore( initialState );

	const context = {
		currentPage: 1,
		search: '',
		filter: { issueTypes: [], showOnlyFavorites: false },
		selectedSites: [],
		sort: { field: 'url', direction: 'asc' },
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
			total: 0,
			perPage: 1,
			totalFavorites: 1,
		};
		const queryKey = [
			'jetpack-agency-dashboard-sites',
			context.search,
			1,
			context.filter,
			context.sort,
		];
		queryClient.setQueryData( queryKey, data );
	};

	beforeEach( () => {
		//some tests manipulate the store, so we need to reset it
		initialState.agencyDashboard.selectedLicenses.licenses = [];
	} );

	test( 'Show the correct empty state message when there are no sites and no applied filters in All tab', async () => {
		setData();

		const { getAllByText } = render( <Wrapper context={ context } /> );
		const [ dashboardHeading ] = getAllByText( 'Sites' );
		expect( dashboardHeading ).toBeInTheDocument();

		const [ dashboardSubHeading ] = getAllByText(
			'Manage all your Jetpack sites from one location'
		);
		expect( dashboardSubHeading ).toBeInTheDocument();

		const [ emptyStateMessage ] = getAllByText( "Let's get started with Jetpack Manage" );
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

	test( 'Do not show the Add X Licenses button when license count is 0', async () => {
		setData();

		const { queryByText } = render( <Wrapper context={ context } /> );

		const addLicensesButton = queryByText( 'Add 1 license' );
		expect( addLicensesButton ).not.toBeInTheDocument();
	} );

	test( 'Show the add site and issue license buttons', async () => {
		setData();

		const { getAllByText } = render( <Wrapper context={ context } /> );

		const [ addSiteButton ] = getAllByText( 'Add New Site' );
		const [ issueLicenseButton ] = getAllByText( 'Issue License' );
		expect( addSiteButton ).toBeInTheDocument();
		expect( issueLicenseButton ).toBeInTheDocument();
	} );

	test( 'Show the Add x Licenses button when a license is selected', async () => {
		initialState.agencyDashboard.selectedLicenses.licenses = [ 'test' ];
		setData();

		const { getAllByText } = render( <Wrapper context={ context } /> );

		const [ issueLicenseButton ] = getAllByText( 'Issue 1 license' );
		expect( issueLicenseButton ).toBeInTheDocument();
	} );

	// the default view for tests is mobile, widescreen buttons behave a bit differently
	test( 'Swap the issue x buttons and add site/add new license buttons on large screen when a license is selected', async () => {
		initialState.agencyDashboard.selectedLicenses.licenses = [ 'test' ];
		setData();

		//set screen to widescreen for this test
		mockedIsWithinBreakpoint.mockReturnValue( true );

		const { queryByText } = render( <Wrapper context={ context } /> );

		const addSiteButton = queryByText( 'Add New Site' );
		const issueLicenseButton = queryByText( 'Issue 1 license' );
		expect( addSiteButton ).not.toBeInTheDocument();
		expect( issueLicenseButton ).toBeInTheDocument();

		// set screen back to mobile for rest of tests
		mockedIsWithinBreakpoint.mockReturnValue( false );
	} );
} );
