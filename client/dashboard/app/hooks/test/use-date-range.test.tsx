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
import { validateDateRangeSearch } from '../../../utils/date-range-search';
import { useDateRange } from '../use-date-range';

function DateRangePage() {
	const { dateRange } = useDateRange( { initializeUrl: true, gmtOffset: 0 } );
	return (
		<p>
			{ dateRange.start.toISOString() } to { dateRange.end.toISOString() }
		</p>
	);
}

describe( 'useDateRange', () => {
	test.each( [
		[ '?from=abc&to=200', undefined ],
		[ '?from=200&to=100', undefined ],
		[ '?from=1735732800000&to=1735819200000', { from: 1735732800, to: 1735819200 } ],
	] )( 'canonicalizes a previous Logs URL on client navigation: %s', async ( search, range ) => {
		// A configured route is needed here: the shared render helper has no validator.
		const root = createRootRoute();
		const start = createRoute( {
			getParentRoute: () => root,
			path: '/start',
			component: () => <h1>Start</h1>,
		} );
		const logs = createRoute( {
			getParentRoute: () => root,
			path: '/logs',
			validateSearch: validateDateRangeSearch,
			component: DateRangePage,
		} );
		const router = createRouter( {
			routeTree: root.addChildren( [ start, logs ] ),
			history: createMemoryHistory( {
				initialEntries: [ `/logs${ search }&keep=present`, '/start' ],
				initialIndex: 1,
			} ),
		} );
		render( <RouterProvider router={ router } /> );
		await screen.findByRole( 'heading', { name: 'Start' } );

		await act( async () => router.history.back() );

		const today = Math.floor( Date.now() / 86400000 ) * 86400;
		const expected = range ?? { from: today - 6 * 86400, to: today + 86399 };
		await waitFor( () => {
			expect( router.state.location.search ).toMatchObject( { ...expected, keep: 'present' } );
			expect( router.state.location.state.__TSR_index ).toBe( 0 );
		} );
		expect(
			screen.getByText(
				`${ new Date( expected.from * 1000 ).toISOString() } to ${ new Date( ( range ? expected.to : today ) * 1000 ).toISOString() }`
			)
		).toBeVisible();
	} );
} );
