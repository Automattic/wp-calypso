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

		// Top heading
		// (text occurs first as an invisible site header,
		// then visibly as the page header)
		const [ , pageHeading ] = screen.queryAllByText( 'Dashboard', { role: 'heading' } );
		expect( pageHeading ).toBeVisible();

		// Sub-heading
		expect(
			screen.queryByText( 'Manage all your Jetpack sites from one location' )
		).toBeInTheDocument();

		// Empty-state onboarding message
		expect(
			screen.queryByText( "Let's get started with the Jetpack Pro Dashboard" )
		).toBeInTheDocument();
	} );

	test( 'Show the correct empty state message when there are no sites and has applied filters in All tab', async () => {
		render( <Wrapper context={ createFakeContext( { search: 'test' } ) } /> );

		expect(
			screen.queryByText( 'No results found. Please try refining your search.' )
		).toBeInTheDocument();
	} );

	test( 'Show the correct empty state message when there are no sites and has applied filters in Favorites tab', () => {
		render(
			<Wrapper
				context={ createFakeContext( { search: 'test', filter: { showOnlyFavorites: true } } ) }
			/>
		);

		expect(
			screen.queryByText( 'No results found. Please try refining your search.' )
		).toBeInTheDocument();
	} );

	test( 'Show the correct empty state message when there are no sites and no applied filters in Favorites tab', () => {
		render( <Wrapper context={ createFakeContext( { filter: { showOnlyFavorites: true } } ) } /> );

		expect( screen.queryByText( "You don't have any favorites yet." ) ).toBeInTheDocument();
	} );

	test( 'Do not show the Add X Licenses button when license count is 0', () => {
		render( <Wrapper /> );

		expect( screen.queryByText( 'Add 1 license', { role: 'button' } ) ).not.toBeInTheDocument();
	} );

	test( 'Show the add site and issue license buttons', () => {
		render( <Wrapper /> );

		expect( screen.queryByText( 'Add New Site', { role: 'button' } ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Issue License', { role: 'button' } ) ).toBeInTheDocument();
	} );

	test( 'Show the "Issue x licenses" button when a license is selected', () => {
		render(
			<Wrapper
				state={ createFakeState( {
					agencyDashboard: { selectedLicenses: { licenses: [ 'test' ] } },
				} ) }
			/>
		);

		expect( screen.queryByText( 'Issue 1 license', { role: 'button' } ) ).toBeInTheDocument();
	} );

	// the default view for tests is mobile, widescreen buttons behave a bit differently
	test( 'Remove the "Add Site" button and replace the "Issue License" button with "Issue x licenses" on large screens, when a license is selected', () => {
		//set screen to widescreen for this test
		isWithinBreakpoint.mockReturnValue( true );

		render(
			<Wrapper
				state={ createFakeState( {
					agencyDashboard: { selectedLicenses: { licenses: [ 'test' ] } },
				} ) }
			/>
		);

		expect( screen.queryByText( 'Add New Site', { role: 'button' } ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Issue License', { role: 'button' } ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Issue 1 license', { role: 'button' } ) ).toBeInTheDocument();
	} );

	test.each( [
		[ 1, 'Issue 1 license' ],
		[ 3, 'Issue 3 licenses' ],
		[ 7, 'Issue 7 licenses' ],
	] )(
		'Shows the correct quantity and grammar in the text of the "Issue x licenses" button',
		( quantity, expectedText ) => {
			// Create an array of length `quantity`, with a non-empty string in each element
			const fakeLicenses = Array.from( { length: quantity }, ( val, index ) => `test-${ index }` );
			expect( fakeLicenses.length ).toBe( quantity );
			expect( fakeLicenses.every( ( s ) => s ) );

			render(
				<Wrapper
					state={ createFakeState( {
						agencyDashboard: { selectedLicenses: { licenses: fakeLicenses } },
					} ) }
				/>
			);

			expect( screen.queryByText( expectedText, { role: 'button' } ) ).toBeInTheDocument();
		}
	);
} );
