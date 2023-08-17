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

	describe( 'When there are no sites', () => {
		test( 'Show the correct message in the All tab with no filters applied', () => {
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

		test( 'Show the correct message in the All tab with a filter applied', () => {
			render( <Wrapper context={ createFakeContext( { search: 'test' } ) } /> );

			expect(
				screen.queryByText( 'No results found. Please try refining your search.' )
			).toBeInTheDocument();
		} );

		test( 'Show the correct message in the Favorites tab with a filter applied', () => {
			render(
				<Wrapper
					context={ createFakeContext( { search: 'test', filter: { showOnlyFavorites: true } } ) }
				/>
			);

			expect(
				screen.queryByText( 'No results found. Please try refining your search.' )
			).toBeInTheDocument();
		} );

		test( 'Show the correct message in the Favorites tab with no filters applied', () => {
			render(
				<Wrapper context={ createFakeContext( { filter: { showOnlyFavorites: true } } ) } />
			);

			expect( screen.queryByText( "You don't have any favorites yet." ) ).toBeInTheDocument();
		} );
	} );

	test( 'Hide the "Add Site" and "Issue License" buttons on large screens when one or more licenses are selected', () => {
		// Pretend we're running this test on a screen that's >960px wide
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
	} );

	test( 'Show the "Add Site" button when no licenses are selected', () => {
		render( <Wrapper /> );

		expect( screen.queryByText( 'Add New Site', { role: 'button' } ) ).toBeInTheDocument();
	} );

	test( 'Show "Issue License" and not "Issue x licenses" when no licenses are selected', () => {
		render( <Wrapper /> );

		expect( screen.queryByText( 'Issue License', { role: 'button' } ) ).toBeInTheDocument();
		expect(
			screen.queryByText( /^Issue \d+ licenses?$/, { role: 'button' } )
		).not.toBeInTheDocument();
	} );

	test.each( [
		{ quantity: 1, expectedText: 'Issue 1 license' },
		{ quantity: 3, expectedText: 'Issue 3 licenses' },
		{ quantity: 7, expectedText: 'Issue 7 licenses' },
	] )(
		'Show a button for "$expectedText" when $quantity licenses are selected',
		( { quantity, expectedText } ) => {
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
