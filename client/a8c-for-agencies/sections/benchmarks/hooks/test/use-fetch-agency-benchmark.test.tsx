/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useSelector } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import useFetchAgencyBenchmark from '../use-fetch-agency-benchmark';
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

describe( 'useFetchAgencyBenchmark', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockedUseSelector.mockReturnValue( 42 ); // agencyId
	} );

	it( 'resolves to null when API returns 404', async () => {
		mockedGet.mockRejectedValueOnce( {
			code: 'benchmark_not_found',
			data: { status: 404 },
		} );

		const { result } = renderHook( () => useFetchAgencyBenchmark( 1, 2026 ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data ).toBeNull();
	} );

	it( 'returns the submission object on 200', async () => {
		const fakeBenchmark = { id: 1, agency_id: 42, quarter: 1, year: 2026 };
		mockedGet.mockResolvedValueOnce( fakeBenchmark );

		const { result } = renderHook( () => useFetchAgencyBenchmark( 1, 2026 ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data ).toBe( fakeBenchmark );
	} );
} );
