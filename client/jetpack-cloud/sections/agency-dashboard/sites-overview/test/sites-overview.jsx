/**
 * @jest-environment jsdom
 */

import { isWithinBreakpoint } from '@automattic/viewport';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import useFetchMonitorVerfiedContacts from 'calypso/data/agency-dashboard/use-fetch-monitor-verified-contacts';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import SitesOverviewContext from '../context';
import SitesOverview from '../index';

jest.mock( '@automattic/viewport' );
jest.mock( 'calypso/data/agency-dashboard/use-fetch-dashboard-sites' );
jest.mock( 'calypso/data/agency-dashboard/use-fetch-monitor-verified-contacts' );
jest.mock( 'calypso/state/partner-portal/licenses/hooks/use-products-query' );

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

	return (
		<Provider store={ store }>
			<SitesOverviewContext.Provider value={ context }>
				<SitesOverview />
			</SitesOverviewContext.Provider>
		</Provider>
	);
};

describe( '<SitesOverview>', () => {
	beforeEach( () => {
		jest.resetAllMocks();

		window.IntersectionObserver = jest.fn( () => ( {
			observe: jest.fn(),
			disconnect: jest.fn(),
			root: null,
			rootMargin: '',
			thresholds: [],
			takeRecords: jest.fn(),
			unobserve: jest.fn(),
		} ) );

		useFetchDashboardSites.mockReturnValue( {
			data: { sites: [], total: 1, perPage: 1, totalFavorites: 1 },
		} );

		useFetchMonitorVerfiedContacts.mockReturnValue( {
			data: {},
		} );

		useProductsQuery.mockReturnValue( {
			data: {},
		} );
	} );

	test( 'Show the correct empty state message when there are no sites and no applied filters in All tab', () => {
		render( <Wrapper /> );
		const [ dashboardHeading ] = screen.getAllByText( 'Dashboard' );
		expect( dashboardHeading ).toBeInTheDocument();

		const [ dashboardSubHeading ] = screen.getAllByText(
			'Manage all your Jetpack sites from one location'
		);
		expect( dashboardSubHeading ).toBeInTheDocument();

		const [ emptyStateMessage ] = screen.getAllByText(
			"Let's get started with the Jetpack Pro Dashboard"
		);
		expect( emptyStateMessage ).toBeInTheDocument();
	} );

	test( 'Show the correct empty state message when there are no sites and has applied filters in All tab', async () => {
		render( <Wrapper context={ createFakeContext( { search: 'test' } ) } /> );

		const [ emptyStateMessage ] = screen.getAllByText(
			'No results found. Please try refining your search.'
		);
		expect( emptyStateMessage ).toBeInTheDocument();
	} );

	test( 'Show the correct empty state message when there are no sites and has applied filters in Favorites tab', () => {
		render(
			<Wrapper
				context={ createFakeContext( { search: 'test', filter: { showOnlyFavorites: true } } ) }
			/>
		);

		const [ emptyStateMessage ] = screen.getAllByText(
			'No results found. Please try refining your search.'
		);
		expect( emptyStateMessage ).toBeInTheDocument();
	} );

	test( 'Show the correct empty state message when there are no sites and no applied filters in Favorites tab', () => {
		render( <Wrapper context={ createFakeContext( { filter: { showOnlyFavorites: true } } ) } /> );

		const [ emptyStateMessage ] = screen.getAllByText( "You don't have any favorites yet." );
		expect( emptyStateMessage ).toBeInTheDocument();
	} );

	test( 'Do not show the Add X Licenses button when license count is 0', () => {
		render( <Wrapper /> );

		const addLicensesButton = screen.queryByText( 'Add 1 license' );
		expect( addLicensesButton ).not.toBeInTheDocument();
	} );

	test( 'Show the add site and issue license buttons', () => {
		render( <Wrapper /> );

		const [ addSiteButton ] = screen.getAllByText( 'Add New Site' );
		const [ issueLicenseButton ] = screen.getAllByText( 'Issue License' );
		expect( addSiteButton ).toBeInTheDocument();
		expect( issueLicenseButton ).toBeInTheDocument();
	} );

	test( 'Show the Add x Licenses button when a license is selected', () => {
		render(
			<Wrapper
				state={ createFakeState( {
					agencyDashboard: { selectedLicenses: { licenses: [ 'test' ] } },
				} ) }
			/>
		);

		const [ issueLicenseButton ] = screen.getAllByText( 'Issue 1 license' );
		expect( issueLicenseButton ).toBeInTheDocument();
	} );

	// the default view for tests is mobile, widescreen buttons behave a bit differently
	test( 'Swap the issue x buttons and add site/add new license buttons on large screen when a license is selected', () => {
		//set screen to widescreen for this test
		isWithinBreakpoint.mockReturnValue( true );

		render(
			<Wrapper
				state={ createFakeState( {
					agencyDashboard: { selectedLicenses: { licenses: [ 'test' ] } },
				} ) }
			/>
		);

		const addSiteButton = screen.queryByText( 'Add New Site' );
		const issueLicenseButton = screen.queryByText( 'Issue 1 license' );
		expect( addSiteButton ).not.toBeInTheDocument();
		expect( issueLicenseButton ).toBeInTheDocument();
	} );
} );
