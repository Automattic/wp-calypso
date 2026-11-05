/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import wpcom from 'calypso/lib/wp';
import useVisitsQuery from '../use-visits-query';

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn( () =>
			Promise.resolve( { unit: 'week', fields: [ 'period', 'views', 'visitors' ], data: [] } )
		),
	},
} ) );

const wrapper = ( { children } ) => {
	const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
};

describe( 'useVisitsQuery', () => {
	it( "asks for the buckets between the range's days, without counting them itself", async () => {
		renderHook(
			() => useVisitsQuery( 123, { unit: 'week', startDate: '2026-07-09', endDate: '2026-10-06' } ),
			{ wrapper }
		);
		await waitFor( () => expect( wpcom.req.get ).toHaveBeenCalled() );

		expect( wpcom.req.get ).toHaveBeenCalledWith( '/sites/123/stats/visits', {
			unit: 'week',
			start_date: '2026-07-09',
			date: '2026-10-06',
			stat_fields: 'views,visitors',
		} );
	} );
} );
