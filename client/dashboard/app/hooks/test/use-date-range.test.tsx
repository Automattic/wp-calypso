/**
 * @jest-environment jsdom
 */

import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	RouterProvider,
} from '@tanstack/react-router';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { validateDateRangeSearch } from '../../../utils/date-range-search';
import { formatSiteYmd } from '../../../utils/datetime';
import { useDateRange } from '../use-date-range';

type Options = Parameters< typeof useDateRange >[ 0 ];

function DateRangePage( { options }: { options: Options } ) {
	const { dateRange, handleDateRangeChange } = useDateRange( { gmtOffset: 0, ...options } );
	return (
		<>
			<p>
				{ formatSiteYmd( dateRange.start ) } to { formatSiteYmd( dateRange.end ) }
			</p>
			<button
				onClick={ () =>
					handleDateRangeChange( { start: new Date( 2025, 0, 1 ), end: new Date( 2025, 0, 2 ) } )
				}
			>
				Select January dates
			</button>
		</>
	);
}

async function restoreRange( search: string, options: Options = {} ) {
	// The shared render helper has no validator or multiple routes.
	const root = createRootRoute();
	const start = createRoute( {
		getParentRoute: () => root,
		path: '/start',
		component: () => <h1>Start</h1>,
	} );
	const routes = [ '/logs', '/backups' ].map( ( path ) =>
		createRoute( {
			getParentRoute: () => root,
			path,
			validateSearch: validateDateRangeSearch,
			component: () => <DateRangePage options={ options } />,
		} )
	);
	const router = createRouter( {
		routeTree: root.addChildren( [ start, ...routes ] ),
		history: createMemoryHistory( {
			initialEntries: [ `/logs${ search }`, '/start' ],
			initialIndex: 1,
		} ),
	} );
	render( <RouterProvider router={ router } /> );
	await screen.findByRole( 'heading', { name: 'Start' } );
	await act( async () => router.history.back() );
	await screen.findByRole( 'button', { name: 'Select January dates' } );
	return router;
}

describe( 'useDateRange', () => {
	test.each( [
		[ '?from=abc&to=200', undefined ],
		[ '?from=200&to=100', undefined ],
		[ '?from=1735732800000&to=1735819200000', { from: 1735732800, to: 1735819200 } ],
	] )( 'canonicalizes a restored Logs URL: %s', async ( search, range ) => {
		const router = await restoreRange( `${ search }&keep=present`, { initializeUrl: true } );
		const today = Math.floor( Date.now() / 86400000 ) * 86400;
		const expected = range ?? { from: today - 6 * 86400, to: today + 86399 };
		await waitFor( () =>
			expect( router.state.location.search ).toMatchObject( { ...expected, keep: 'present' } )
		);
		expect( router.state.location.state.__TSR_index ).toBe( 0 );
	} );

	test.each< [ Options, string, number | undefined ] >( [
		[ {}, '/logs', 2 ],
		[ { resetPageOnChange: true }, '/logs', undefined ],
		[ { selectionPath: '/backups' }, '/backups', 2 ],
		[ { selectionPath: '/backups', resetPageOnChange: true }, '/backups', undefined ],
	] )( 'writes dates atomically with options %j', async ( options, pathname, page ) => {
		const router = await restoreRange( '?page=2&severity=warning', options );
		router.history.block( { blockerFn: async () => false, enableBeforeUnload: false } );
		await userEvent.click( screen.getByRole( 'button', { name: 'Select January dates' } ) );
		await waitFor( () => {
			expect( router.state.location.pathname ).toBe( pathname );
			expect( router.state.location.search ).toMatchObject( {
				from: 1735689600,
				to: 1735862399,
				severity: 'warning',
			} );
			expect( new URLSearchParams( router.state.location.searchStr ).get( 'page' ) ).toBe(
				page === undefined ? null : String( page )
			);
		} );
		expect( screen.getByText( '2025-01-01 to 2025-01-02' ) ).toBeVisible();
		expect( router.history.length ).toBe( 2 );
		expect( router.state.location.state.__TSR_index ).toBe( 0 );
	} );

	test( 'derives site calendar dates from URL instants when going back', async () => {
		const router = await restoreRange( '?from=1735707600&to=1735880399', { gmtOffset: -5 } );
		expect( screen.getByText( '2025-01-01 to 2025-01-02' ) ).toBeVisible();
		await act( async () => {
			await router.navigate( { to: '/logs', search: { from: 1735880400, to: 1735966799 } } );
		} );
		expect( await screen.findByText( '2025-01-03 to 2025-01-03' ) ).toBeVisible();
		await act( async () => router.history.back() );
		expect( await screen.findByText( '2025-01-01 to 2025-01-02' ) ).toBeVisible();
	} );

	test( 'falls back to the default range when URL dates cannot be represented by the picker', async () => {
		await restoreRange( '?from=253402300800&to=253402387199' );

		const today = new Date();
		const start = new Date( today.getFullYear(), today.getMonth(), today.getDate() - 6 );
		expect(
			screen.getByText( `${ formatSiteYmd( start ) } to ${ formatSiteYmd( today ) }` )
		).toBeVisible();
	} );
} );
