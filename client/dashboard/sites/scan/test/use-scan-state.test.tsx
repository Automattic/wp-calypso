/**
 * @jest-environment jsdom
 */
import { type SiteScan, fetchSiteScan } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { useScanState } from '../use-scan-state';

jest.mock( '@automattic/api-core', () => ( {
	...jest.requireActual( '@automattic/api-core' ),
	fetchSiteScan: jest.fn(),
} ) );

const mockFetchSiteScan = fetchSiteScan as jest.MockedFunction< typeof fetchSiteScan >;

const createSiteScan = ( overrides: Partial< SiteScan > = {} ): SiteScan => ( {
	state: 'idle',
	threats: [],
	has_cloud: true,
	current: undefined,
	most_recent: {
		is_initial: false,
		timestamp: '2025-08-26T00:44:15Z',
		duration: 120,
		progress: 100,
		error: false,
	},
	...overrides,
} );

let testQueryClient: QueryClient;

function TestWrapper( { children }: { children: React.ReactNode } ) {
	const [ queryClient ] = React.useState(
		() =>
			new QueryClient( {
				defaultOptions: {
					queries: { retry: false },
				},
			} )
	);

	testQueryClient = queryClient;

	return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
}

function mockScanAPI( scan: SiteScan ) {
	mockFetchSiteScan.mockResolvedValue( scan );
}

afterEach( () => {
	mockFetchSiteScan.mockReset();
} );

describe( 'useScanState', () => {
	const mockSiteId = 123;

	beforeEach( () => {
		mockScanAPI( createSiteScan() );
	} );

	describe( 'idle state', () => {
		it( 'should return idle when first establishing timestamp baseline', async () => {
			const scanWithNewTimestamp = createSiteScan( {
				most_recent: {
					is_initial: false,
					timestamp: '2025-08-26T10:00:00Z',
					duration: 120,
					progress: 100,
					error: false,
				},
			} );
			mockScanAPI( scanWithNewTimestamp );

			const { result } = renderHook( () => useScanState( mockSiteId ), {
				wrapper: TestWrapper,
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'idle' );
				expect( typeof result.current.setIsEnqueued ).toBe( 'function' );
			} );
		} );

		it( 'should return idle state for default scan data', async () => {
			const { result } = renderHook( () => useScanState( mockSiteId ), {
				wrapper: TestWrapper,
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'idle' );
				expect( typeof result.current.setIsEnqueued ).toBe( 'function' );
			} );
		} );
	} );

	describe( 'enqueued state', () => {
		it( 'should return enqueued state when manually enqueued', async () => {
			const { result } = renderHook( () => useScanState( mockSiteId ), {
				wrapper: TestWrapper,
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'idle' );
			} );

			act( () => {
				result.current.setIsEnqueued( true );
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'enqueued' );
			} );
		} );

		it( 'should reset success state when enqueued', async () => {
			const scan = createSiteScan( {
				most_recent: {
					is_initial: false,
					timestamp: '2025-08-26T00:44:15Z',
					duration: 120,
					progress: 100,
					error: false,
				},
			} );
			mockScanAPI( scan );

			const { result } = renderHook( () => useScanState( mockSiteId ), {
				wrapper: TestWrapper,
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'idle' );
			} );

			const newScan = createSiteScan( {
				most_recent: {
					is_initial: false,
					timestamp: '2025-08-26T01:00:00Z',
					duration: 130,
					progress: 100,
					error: false,
				},
			} );
			mockScanAPI( newScan );

			await testQueryClient.refetchQueries( {
				queryKey: [ 'site', mockSiteId, 'scan' ],
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'success' );
			} );
			act( () => {
				result.current.setIsEnqueued( true );
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'enqueued' );
			} );
		} );
	} );

	describe( 'running state', () => {
		it( 'should detect when scan is currently running', async () => {
			const runningScan = createSiteScan( {
				state: 'scanning',
				current: {
					is_initial: false,
					timestamp: '2025-08-26T01:00:00Z',
					progress: 50,
				},
				most_recent: undefined,
			} );
			mockScanAPI( runningScan );

			const { result } = renderHook( () => useScanState( mockSiteId ), {
				wrapper: TestWrapper,
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'running' );
				expect( result.current.scan ).toEqual( runningScan );
			} );
		} );

		it( 'should reset isEnqueued when scan starts running', async () => {
			const { result } = renderHook( () => useScanState( mockSiteId ), {
				wrapper: TestWrapper,
			} );

			act( () => {
				result.current.setIsEnqueued( true );
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'enqueued' );
			} );

			const runningScan = createSiteScan( {
				state: 'scanning',
				current: {
					is_initial: false,
					timestamp: '2025-08-26T01:00:00Z',
					progress: 25,
				},
				most_recent: undefined,
			} );
			mockScanAPI( runningScan );

			await testQueryClient.refetchQueries( {
				queryKey: [ 'site', mockSiteId, 'scan' ],
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'running' );
			} );
		} );
	} );

	describe( 'success state', () => {
		it( 'should return success when hasSucceeded is true', async () => {
			const scan = createSiteScan( {
				most_recent: {
					is_initial: false,
					timestamp: '2025-08-26T00:44:15Z',
					duration: 120,
					progress: 100,
					error: false,
				},
			} );
			mockScanAPI( scan );

			const { result } = renderHook( () => useScanState( mockSiteId ), {
				wrapper: TestWrapper,
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'idle' );
			} );

			// Simulate scan completion with new timestamp
			const completedScan = createSiteScan( {
				most_recent: {
					is_initial: false,
					timestamp: '2025-08-26T01:00:00Z', // New timestamp
					duration: 130,
					progress: 100,
					error: false,
				},
			} );
			mockScanAPI( completedScan );

			await testQueryClient.refetchQueries( {
				queryKey: [ 'site', mockSiteId, 'scan' ],
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'success' );
				expect( result.current.scan ).toEqual( completedScan );
			} );
		} );

		it( 'should detect new scan completion by timestamp change', async () => {
			const initialScan = createSiteScan( {
				most_recent: {
					is_initial: false,
					timestamp: '2025-08-26T00:44:15Z',
					duration: 120,
					progress: 100,
					error: false,
				},
			} );
			mockScanAPI( initialScan );

			const { result } = renderHook( () => useScanState( mockSiteId ), {
				wrapper: TestWrapper,
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'idle' );
			} );

			const newScan = createSiteScan( {
				most_recent: {
					is_initial: false,
					timestamp: '2025-08-26T02:00:00Z', // Different timestamp
					duration: 125,
					progress: 100,
					error: false,
				},
			} );
			mockScanAPI( newScan );

			await testQueryClient.refetchQueries( {
				queryKey: [ 'site', mockSiteId, 'scan' ],
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'success' );
			} );
		} );
	} );

	describe( 'error state', () => {
		it( 'should return error state when scan has error and no timestamp', async () => {
			const errorScan = createSiteScan( {
				state: 'idle',
				current: undefined,
				most_recent: {
					is_initial: false,
					timestamp: '',
					duration: 60,
					progress: 45,
					error: true,
				},
			} );
			mockScanAPI( errorScan );

			const { result } = renderHook( () => useScanState( mockSiteId ), {
				wrapper: TestWrapper,
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'error' );
				expect( result.current.scan ).toEqual( errorScan );
			} );
		} );

		it( 'should return error state with same timestamp as baseline', async () => {
			const initialScan = createSiteScan( {
				most_recent: {
					is_initial: false,
					timestamp: '2025-08-26T00:44:15Z',
					duration: 120,
					progress: 100,
					error: false,
				},
			} );
			mockScanAPI( initialScan );

			const { result } = renderHook( () => useScanState( mockSiteId ), {
				wrapper: TestWrapper,
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'idle' );
			} );
			const errorScan = createSiteScan( {
				state: 'idle',
				current: undefined,
				most_recent: {
					is_initial: false,
					timestamp: '2025-08-26T00:44:15Z',
					duration: 60,
					progress: 45,
					error: true,
				},
			} );
			mockScanAPI( errorScan );

			await testQueryClient.refetchQueries( {
				queryKey: [ 'site', mockSiteId, 'scan' ],
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'error' );
				expect( result.current.scan ).toEqual( errorScan );
			} );
		} );
	} );

	describe( 'edge cases', () => {
		it( 'should handle empty timestamp', async () => {
			const scanWithoutTimestamp = createSiteScan( {
				most_recent: {
					is_initial: false,
					timestamp: '',
					duration: 120,
					progress: 100,
					error: false,
				},
			} );
			mockScanAPI( scanWithoutTimestamp );

			const { result } = renderHook( () => useScanState( mockSiteId ), {
				wrapper: TestWrapper,
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'idle' );
			} );
		} );

		it( 'should handle missing most_recent data', async () => {
			const scanWithoutMostRecent = createSiteScan( {
				most_recent: undefined,
				current: undefined,
			} );
			mockScanAPI( scanWithoutMostRecent );

			const { result } = renderHook( () => useScanState( mockSiteId ), {
				wrapper: TestWrapper,
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'idle' );
			} );
		} );
	} );

	describe( 'setIsEnqueued function', () => {
		it( 'should toggle enqueued state', async () => {
			const { result } = renderHook( () => useScanState( mockSiteId ), {
				wrapper: TestWrapper,
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'idle' );
			} );

			act( () => {
				result.current.setIsEnqueued( true );
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'enqueued' );
			} );
			act( () => {
				result.current.setIsEnqueued( false );
			} );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'idle' );
			} );
		} );
	} );
} );
