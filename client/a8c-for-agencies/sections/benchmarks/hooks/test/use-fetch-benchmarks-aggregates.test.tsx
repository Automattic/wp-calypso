/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useSelector } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import useFetchBenchmarksAggregates from '../use-fetch-benchmarks-aggregates';
import type { ReactNode } from 'react';

jest.mock( 'react-redux', () => ( {
	useSelector: jest.fn(),
} ) );

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: {
		req: {
			get: jest.fn(),
		},
	},
} ) );

const mockedGet = wpcom.req.get as jest.MockedFunction< typeof wpcom.req.get >;
const mockedUseSelector = useSelector as unknown as jest.Mock;

function wrapper( { children }: { children: ReactNode } ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );
	return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
}

describe( 'useFetchBenchmarksAggregates', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns aggregate rows on success', async () => {
		mockedUseSelector.mockReturnValue( 42 );
		const fakeAggregates = [
			{
				quarter: 1,
				year: 2026,
				sample_size: 17,
				metrics: {
					gross_margin: { mean: 38.21, min: 33.8, p25: 36.5, median: 39.2, p75: 41.7, max: 57.5 },
				},
			},
		];
		mockedGet.mockResolvedValueOnce( fakeAggregates );

		const { result } = renderHook( () => useFetchBenchmarksAggregates(), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data ).toEqual( fakeAggregates );
		expect( mockedGet ).toHaveBeenCalledWith( {
			apiNamespace: 'wpcom/v2',
			path: '/agency/42/benchmarks/aggregates',
		} );
	} );

	it( 'is disabled when there is no active agency', () => {
		mockedUseSelector.mockReturnValue( undefined );

		const { result } = renderHook( () => useFetchBenchmarksAggregates(), { wrapper } );

		expect( result.current.fetchStatus ).toBe( 'idle' );
		expect( mockedGet ).not.toHaveBeenCalled();
	} );
} );
