/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useSelector } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import useFetchBenchmarkPeers from '../use-fetch-benchmark-peers';
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

describe( 'useFetchBenchmarkPeers', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockedUseSelector.mockReturnValue( 42 ); // agencyId
	} );

	it( 'returns peer payload on 200 and forwards quarter/year as query params', async () => {
		const payload = {
			quarter: 1,
			year: 2026,
			sample_size: 1,
			peers: [
				{
					label: 'A',
					metrics: {
						gross_margin: 38.7,
						billable_utilization: 64.2,
						avg_project_size_usd: 18900,
						win_rate: 32.1,
						retainer_mrr_usd: 10500,
						avg_time_to_close_days: 22,
						client_retention: 88.9,
						ai_maturity_score: 45,
					},
				},
			],
		};
		mockedGet.mockResolvedValueOnce( payload );

		const { result } = renderHook( () => useFetchBenchmarkPeers( 1, 2026 ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data ).toEqual( payload );
		expect( mockedGet ).toHaveBeenCalledWith(
			{
				apiNamespace: 'wpcom/v2',
				path: '/agency/42/benchmarks/peers',
			},
			{ quarter: 1, year: 2026 }
		);
	} );

	it( 'resolves to null on 403 benchmark_peers_forbidden (agency has not submitted)', async () => {
		mockedGet.mockRejectedValueOnce( {
			code: 'benchmark_peers_forbidden',
			data: { status: 403 },
		} );

		const { result } = renderHook( () => useFetchBenchmarkPeers( 1, 2026 ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data ).toBeNull();
	} );

	it( 'is disabled when there is no active agency', () => {
		mockedUseSelector.mockReturnValue( undefined );

		const { result } = renderHook( () => useFetchBenchmarkPeers( 1, 2026 ), { wrapper } );

		expect( result.current.fetchStatus ).toBe( 'idle' );
		expect( mockedGet ).not.toHaveBeenCalled();
	} );
} );
