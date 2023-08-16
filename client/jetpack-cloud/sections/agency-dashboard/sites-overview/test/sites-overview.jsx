/**
 * @jest-environment jsdom
 */

import { isWithinBreakpoint } from '@automattic/viewport';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, act } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import SitesOverviewContext from '../context';
import SitesOverview from '../index';

jest.mock( '@automattic/viewport' );

const createFakeState = ( changes = {} ) => ( {
	sites: {},
	partnerPortal: { partner: {} },
	agencyDashboard: {
		selectedLicenses: {
			licenses: [],
		},
	},
	ui: {},
	documentHead: {},
	currentUser: {
		capabilities: {},
	},
	...changes,
} );

const createFakeContext = ( changes = {} ) => ( {
	currentPage: 1,
	search: '',
	filter: { issueTypes: [], showOnlyFavorites: false },
	selectedSites: [],
	sort: { field: 'url', direction: 'asc' },
	...changes,
} );

const Wrapper = ( { state = createFakeState(), context = createFakeContext() } ) => {
	const mockStore = configureStore( [ thunk ] );
	const store = mockStore( state );

	const queryClient = new QueryClient();
	queryClient.setQueryData(
		[ 'jetpack-agency-dashboard-sites', context.search, 1, context.filter, context.sort ],
		{
			sites: [],
			total: 1,
			perPage: 1,
			totalFavorites: 1,
		}
	);

	return (
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<SitesOverviewContext.Provider value={ context }>
					<SitesOverview />
				</SitesOverviewContext.Provider>
			</QueryClientProvider>
		</Provider>
	);
};

describe( '<SitesOverview>', () => {
	beforeAll( () => {
		window.IntersectionObserver = jest.fn( () => ( {
			observe: jest.fn(),
			disconnect: jest.fn(),
			root: null,
			rootMargin: '',
			thresholds: [],
			takeRecords: jest.fn(),
			unobserve: jest.fn(),
		} ) );
	} );

	test( 'Show the correct empty state message when there are no sites and no applied filters in All tab', async () => {
		const { getAllByText } = render( <Wrapper /> );
		const [ dashboardHeading ] = getAllByText( 'Dashboard' );
		expect( dashboardHeading ).toBeInTheDocument();

		const [ dashboardSubHeading ] = getAllByText(
			'Manage all your Jetpack sites from one location'
		);
		expect( dashboardSubHeading ).toBeInTheDocument();

		const [ emptyStateMessage ] = getAllByText(
			"Let's get started with the Jetpack Pro Dashboard"
		);
		expect( emptyStateMessage ).toBeInTheDocument();

		await act( () => Promise.resolve() );
	} );

	test( 'Show the correct empty state message when there are no sites and has applied filters in All tab', async () => {
		const { getAllByText } = render(
			<Wrapper context={ createFakeContext( { search: 'test' } ) } />
		);

		const [ emptyStateMessage ] = getAllByText(
			'No results found. Please try refining your search.'
		);
		expect( emptyStateMessage ).toBeInTheDocument();

		const promise = Promise.resolve();
		await act( () => promise );
	} );

	test( 'Show the correct empty state message when there are no sites and has applied filters in Favorites tab', async () => {
		const { getAllByText } = render(
			<Wrapper
				context={ createFakeContext( { search: 'test', filter: { showOnlyFavorites: true } } ) }
			/>
		);

		const [ emptyStateMessage ] = getAllByText(
			'No results found. Please try refining your search.'
		);
		expect( emptyStateMessage ).toBeInTheDocument();

		await act( () => Promise.resolve() );
	} );

	test( 'Show the correct empty state message when there are no sites and no applied filters in Favorites tab', async () => {
		const { getAllByText } = render(
			<Wrapper context={ createFakeContext( { filter: { showOnlyFavorites: true } } ) } />
		);

		const [ emptyStateMessage ] = getAllByText( "You don't have any favorites yet." );
		expect( emptyStateMessage ).toBeInTheDocument();

		await act( () => Promise.resolve() );
	} );

	test( 'Do not show the Add X Licenses button when license count is 0', async () => {
		const { queryByText } = render( <Wrapper /> );

		const addLicensesButton = queryByText( 'Add 1 license' );
		expect( addLicensesButton ).not.toBeInTheDocument();

		await act( () => Promise.resolve() );
	} );

	test( 'Show the add site and issue license buttons', async () => {
		const { getAllByText } = render( <Wrapper /> );

		const [ addSiteButton ] = getAllByText( 'Add New Site' );
		const [ issueLicenseButton ] = getAllByText( 'Issue License' );
		expect( addSiteButton ).toBeInTheDocument();
		expect( issueLicenseButton ).toBeInTheDocument();

		await act( () => Promise.resolve() );
	} );

	test( 'Show the Add x Licenses button when a license is selected', async () => {
		const { getAllByText } = render(
			<Wrapper
				state={ createFakeState( {
					agencyDashboard: { selectedLicenses: { licenses: [ 'test' ] } },
				} ) }
			/>
		);

		const [ issueLicenseButton ] = getAllByText( 'Issue 1 license' );
		expect( issueLicenseButton ).toBeInTheDocument();

		await act( () => Promise.resolve() );
	} );

	// the default view for tests is mobile, widescreen buttons behave a bit differently
	test( 'Swap the issue x buttons and add site/add new license buttons on large screen when a license is selected', async () => {
		//set screen to widescreen for this test
		isWithinBreakpoint.mockReturnValue( true );

		const { queryByText } = render(
			<Wrapper
				state={ createFakeState( {
					agencyDashboard: { selectedLicenses: { licenses: [ 'test' ] } },
				} ) }
			/>
		);

		const addSiteButton = queryByText( 'Add New Site' );
		const issueLicenseButton = queryByText( 'Issue 1 license' );
		expect( addSiteButton ).not.toBeInTheDocument();
		expect( issueLicenseButton ).toBeInTheDocument();

		// set screen back to mobile for rest of tests
		isWithinBreakpoint.mockReturnValue( false );

		await act( () => Promise.resolve() );
	} );
} );
