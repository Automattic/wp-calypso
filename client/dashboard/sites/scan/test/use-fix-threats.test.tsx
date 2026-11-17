/**
 * @vitest-environment jsdom
 */
import { fixThreatsStatusQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react';
import nock from 'nock';
import { type ReactNode } from 'react';
import { useFixThreats } from '../hooks/use-fix-threats';
import type { FixThreatsStatusResponse } from '@automattic/api-core';

let queryClient: QueryClient;

function TestWrapper( { children }: { children: ReactNode } ) {
	return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
}

describe( 'useFixThreats', () => {
	const mockSiteId = 210000000;
	const mockThreatIds = [ 100001, 100002, 100003 ];

	function mockFixRequest() {
		return nock( 'https://public-api.wordpress.com' )
			.post( `/wpcom/v2/sites/${ mockSiteId }/alerts/fix`, { threat_ids: mockThreatIds } )
			.reply( 200, {} );
	}

	function mockFixStatus( threats: FixThreatsStatusResponse[ 'threats' ] | null = {} ) {
		return nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ mockSiteId }/alerts/fix` )
			.query( { 'threat_ids[]': mockThreatIds.map( String ) } )
			.reply( 200, { ok: true, threats } );
	}

	// Until the status response arrives, the hook reports the same status as for threats still in
	// progress, so wait for the response before asserting on it.
	function waitForFixStatus() {
		return waitFor( () =>
			expect(
				queryClient.getQueryState( fixThreatsStatusQuery( mockSiteId, mockThreatIds ).queryKey )
					?.status
			).toBe( 'success' )
		);
	}

	beforeEach( () => {
		queryClient = new QueryClient( {
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		} );
	} );

	describe( 'initial state', () => {
		test( 'should return initial state when not fixing', () => {
			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			expect( result.current.isFixing ).toBe( false );
			expect( result.current.status.isComplete ).toBe( false );
			expect( result.current.status.allFixed ).toBe( false );
			expect( result.current.error ).toBeNull();
		} );
	} );

	describe( 'startFix', () => {
		test( 'should set isFixing to true when startFix is called', () => {
			mockFixRequest();
			mockFixStatus();

			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			act( () => result.current.startFix() );

			expect( result.current.isFixing ).toBe( true );
		} );

		test( 'should call mutation with correct threat IDs', async () => {
			const scope = mockFixRequest();
			mockFixStatus();

			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			act( () => result.current.startFix() );

			await waitFor( () => {
				expect( scope.isDone() ).toBe( true );
			} );
		} );
	} );

	describe( 'status calculation', () => {
		test( 'should return isComplete false when threats are in progress', async () => {
			mockFixRequest();
			mockFixStatus( {
				100001: { status: 'in_progress' },
				100002: { status: 'in_progress' },
				100003: { status: 'fixed' },
			} );

			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			act( () => result.current.startFix() );

			await waitForFixStatus();

			expect( result.current.status.isComplete ).toBe( false );
			expect( result.current.status.allFixed ).toBe( false );
		} );

		test( 'should return isComplete true and allFixed true when all threats are fixed', async () => {
			mockFixRequest();
			mockFixStatus( {
				100001: { status: 'fixed' },
				100002: { status: 'fixed' },
				100003: { status: 'fixed' },
			} );

			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			act( () => result.current.startFix() );

			await waitForFixStatus();

			expect( result.current.status.isComplete ).toBe( true );
			expect( result.current.status.allFixed ).toBe( true );
		} );

		test( 'should return isComplete true and allFixed false when some threats are not fixed', async () => {
			mockFixRequest();
			mockFixStatus( {
				100001: { status: 'fixed' },
				100002: { status: 'not_fixed' },
				100003: { status: 'fixed' },
			} );

			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			act( () => result.current.startFix() );

			await waitForFixStatus();

			expect( result.current.status.isComplete ).toBe( true );
			expect( result.current.status.allFixed ).toBe( false );
		} );

		test( 'should return isComplete true and allFixed false when all threats are not fixed', async () => {
			mockFixRequest();
			mockFixStatus( {
				100001: { status: 'not_fixed' },
				100002: { status: 'not_fixed' },
				100003: { status: 'not_fixed' },
			} );

			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			act( () => result.current.startFix() );

			await waitForFixStatus();

			expect( result.current.status.isComplete ).toBe( true );
			expect( result.current.status.allFixed ).toBe( false );
		} );

		test( 'should return isComplete false when threats are not started', async () => {
			mockFixRequest();
			mockFixStatus( {
				100001: { status: 'not_started' },
				100002: { status: 'not_started' },
				100003: { status: 'not_started' },
			} );

			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			act( () => result.current.startFix() );

			await waitForFixStatus();

			expect( result.current.status.isComplete ).toBe( false );
			expect( result.current.status.allFixed ).toBe( false );
		} );
	} );

	describe( 'completion handling', () => {
		test( 'should stop fixing when all threats are complete', async () => {
			mockFixRequest();
			mockFixStatus( {
				100001: { status: 'fixed' },
				100002: { status: 'fixed' },
				100003: { status: 'fixed' },
			} );

			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			act( () => result.current.startFix() );

			await waitFor( () => {
				expect( result.current.isFixing ).toBe( true );
			} );

			await waitFor( () => {
				expect( result.current.isFixing ).toBe( false );
				expect( result.current.status.isComplete ).toBe( true );
				expect( result.current.status.allFixed ).toBe( true );
			} );
		} );
	} );

	describe( 'polling behavior', () => {
		test( 'should call fetchFixThreatsStatus when fixing is in progress', async () => {
			mockFixRequest();
			const scope = mockFixStatus();

			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			act( () => result.current.startFix() );

			await waitFor( () => {
				expect( scope.isDone() ).toBe( true );
			} );
		} );

		test( 'should not call fetchFixThreatsStatus when not fixing', async () => {
			const scope = mockFixStatus();

			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			expect( result.current.isFixing ).toBe( false );
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
			expect( scope.isDone() ).toBe( false );
		} );
	} );

	describe( 'error handling', () => {
		test( 'should reset to idle state when mutation fails', async () => {
			nock( 'https://public-api.wordpress.com' )
				.post( `/wpcom/v2/sites/${ mockSiteId }/alerts/fix` )
				.reply( 500, { error: 'api_error', message: 'API Error' } );
			mockFixStatus();

			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			act( () => result.current.startFix() );

			expect( result.current.isFixing ).toBe( true );

			await waitFor( () => {
				expect( result.current.isFixing ).toBe( false );
				expect( result.current.error ).toBeTruthy();
			} );
		} );

		test( 'should handle malformed API response', async () => {
			mockFixRequest();
			mockFixStatus( null );

			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			act( () => result.current.startFix() );

			await waitForFixStatus();

			expect( result.current.status.isComplete ).toBe( false );
			expect( result.current.status.allFixed ).toBe( false );
		} );
	} );
} );
