/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { useSitePerformanceData } from '../use-site-performance-data';
import type { ReactNode } from 'react';

const PAGE_URL = 'https://example.com/';
const FINAL_URL = 'https://www.example.com/';
const API = 'https://public-api.wordpress.com';
const BASIC_PATH = '/wpcom/v2/site-profiler/metrics/basic';
const INSIGHTS_PATH = '/wpcom/v2/site-profiler/metrics/advanced/insights';

const completedInsights = { pagespeed: { status: 'completed', mobile: {}, desktop: {} } };

function wrapper( { children }: { children: ReactNode } ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
}

function mockInsights( url: string, hash: string ) {
	return nock( API )
		.get( INSIGHTS_PATH )
		.query( ( query ) => query.url === url && query.hash === hash )
		.reply( 200, completedInsights );
}

describe( 'useSitePerformanceData', () => {
	test( 'requests insights for a new report with the final URL its token was issued for', async () => {
		nock( API )
			.get( BASIC_PATH )
			.query( true )
			.reply( 200, { final_url: FINAL_URL, token: 'new-token' } );
		const insights = mockInsights( FINAL_URL, 'new-token' );

		renderHook( () => useSitePerformanceData( PAGE_URL, undefined ), { wrapper } );

		await waitFor( () => expect( insights.isDone() ).toBe( true ) );
	} );

	test( 'requests insights with the page URL when the response has no final URL', async () => {
		nock( API ).get( BASIC_PATH ).query( true ).reply( 200, { token: 'new-token' } );
		const insights = mockInsights( PAGE_URL, 'new-token' );

		renderHook( () => useSitePerformanceData( PAGE_URL, undefined ), { wrapper } );

		await waitFor( () => expect( insights.isDone() ).toBe( true ) );
	} );

	test( 'requests insights for a saved report with the URL it was given', async () => {
		const insights = mockInsights( FINAL_URL, 'saved-hash' );

		renderHook( () => useSitePerformanceData( FINAL_URL, 'saved-hash' ), { wrapper } );

		await waitFor( () => expect( insights.isDone() ).toBe( true ) );
	} );
} );
