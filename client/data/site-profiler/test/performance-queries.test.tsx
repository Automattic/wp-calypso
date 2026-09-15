/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useUrlPerformanceInsightsQuery } from '../use-url-performance-insights';
import { useUrlPerformanceMetricsQuery } from '../use-url-performance-metrics-query';
import type { PropsWithChildren } from 'react';

const mockGet = jest.fn();
jest.mock( 'calypso/lib/wp', () => ( {
	req: { get: ( ...args: unknown[] ) => mockGet( ...args ) },
} ) );

let queryClient: QueryClient;
beforeEach( () => {
	queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	mockGet.mockReset();
} );
afterEach( () => queryClient.clear() );

function wrapper( { children }: PropsWithChildren ) {
	return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
}

test.each( [ 'metrics', 'insights' ] )(
	'keeps performance responses separate when %s loads first',
	async ( first ) => {
		const metrics = { webtestpage_org: { status: 'completed', report: { performance: 91 } } };
		const insights = {
			pagespeed: { status: 'completed', mobile: 'report', desktop: 'report' },
			wpscan: { status: 'completed' },
		};
		mockGet.mockImplementation( ( { path } ) =>
			Promise.resolve( path.endsWith( '/insights' ) ? insights : metrics )
		);
		const hooks =
			first === 'metrics'
				? [ useUrlPerformanceMetricsQuery, useUrlPerformanceInsightsQuery ]
				: [ useUrlPerformanceInsightsQuery, useUrlPerformanceMetricsQuery ];
		const firstHook = renderHook( () => hooks[ 0 ]( 'https://example.com', 'scan-hash' ), {
			wrapper,
		} );
		const secondHook = renderHook( () => hooks[ 1 ]( 'https://example.com', 'scan-hash' ), {
			wrapper,
		} );
		await waitFor( () => {
			expect( firstHook.result.current.isSuccess ).toBe( true );
			expect( secondHook.result.current.isSuccess ).toBe( true );
		} );
		expect( firstHook.result.current.data ).toEqual(
			first === 'metrics' ? metrics.webtestpage_org.report : insights
		);
		expect( secondHook.result.current.data ).toEqual(
			first === 'metrics' ? insights : metrics.webtestpage_org.report
		);
		expect( mockGet ).toHaveBeenCalledTimes( 2 );
	}
);
