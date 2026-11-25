/**
 * @vitest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { type Mock, type MockedFunction, vi } from 'vitest';
import wpcom from 'calypso/lib/wp';
import useFetchBenchmarksConfig from '../use-fetch-benchmarks-config';
import type { ReactNode } from 'react';

vi.mock( 'react-redux', () => ( {
	useSelector: vi.fn(),
} ) );

vi.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: {
		req: {
			get: vi.fn(),
		},
	},
} ) );

const mockedGet = wpcom.req.get as MockedFunction< typeof wpcom.req.get >;
const mockedUseSelector = useSelector as unknown as Mock;

function wrapper( { children }: { children: ReactNode } ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );
	return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
}

describe( 'useFetchBenchmarksConfig', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	it( 'returns the submission window on success', async () => {
		mockedUseSelector.mockReturnValue( 42 );
		const fakeConfig = {
			submission_window: {
				earliest: { quarter: 1, year: 2025 },
				latest: { quarter: 1, year: 2026 },
			},
		};
		mockedGet.mockResolvedValueOnce( fakeConfig );

		const { result } = renderHook( () => useFetchBenchmarksConfig(), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data ).toEqual( fakeConfig );
		expect( mockedGet ).toHaveBeenCalledWith( {
			apiNamespace: 'wpcom/v2',
			path: '/agency/42/benchmarks/config',
		} );
	} );

	it( 'is disabled when there is no active agency', () => {
		mockedUseSelector.mockReturnValue( undefined );

		const { result } = renderHook( () => useFetchBenchmarksConfig(), { wrapper } );

		expect( result.current.fetchStatus ).toBe( 'idle' );
		expect( mockedGet ).not.toHaveBeenCalled();
	} );
} );
