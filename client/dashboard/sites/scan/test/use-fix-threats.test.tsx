/**
 * @jest-environment jsdom
 */
import { fixThreats, fetchFixThreatsStatus } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useState, type ReactNode } from 'react';
import { useFixThreats } from '../hooks/use-fix-threats';
import type { FixThreatsStatusResponse } from '@automattic/api-core';

// Mock the API core functions
jest.mock( '@automattic/api-core', () => ( {
	fixThreats: jest.fn(),
	fetchFixThreatsStatus: jest.fn(),
} ) );

const mockFixThreats = fixThreats as jest.MockedFunction< typeof fixThreats >;
const mockFetchFixThreatsStatus = fetchFixThreatsStatus as jest.MockedFunction<
	typeof fetchFixThreatsStatus
>;

const createFixThreatsStatusResponse = (
	threats: FixThreatsStatusResponse[ 'threats' ]
): FixThreatsStatusResponse => ( {
	ok: true,
	threats,
} );

function TestWrapper( { children }: { children: ReactNode } ) {
	const [ queryClient ] = useState(
		() =>
			new QueryClient( {
				defaultOptions: {
					queries: { retry: false },
					mutations: { retry: false },
				},
			} )
	);

	return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
}

describe( 'useFixThreats', () => {
	const mockSiteId = 210000000;
	const mockThreatIds = [ 100001, 100002, 100003 ];

	beforeEach( () => {
		// Setup default mock implementation
		mockFetchFixThreatsStatus.mockResolvedValue( createFixThreatsStatusResponse( {} ) );
	} );

	describe( 'initial state', () => {
		it( 'should return initial state when not fixing', () => {
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
		it( 'should set isFixing to true when startFix is called', () => {
			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			act( () => result.current.startFix() );

			expect( result.current.isFixing ).toBe( true );
		} );

		it( 'should call mutation with correct threat IDs', async () => {
			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			act( () => result.current.startFix() );

			await waitFor( () => {
				expect( mockFixThreats ).toHaveBeenCalledWith( mockSiteId, mockThreatIds );
			} );
		} );
	} );

	describe( 'status calculation', () => {
		it( 'should return isComplete false when threats are in progress', async () => {
			mockFetchFixThreatsStatus.mockResolvedValue(
				createFixThreatsStatusResponse( {
					100001: { status: 'in_progress' },
					100002: { status: 'in_progress' },
					100003: { status: 'fixed' },
				} )
			);

			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			act( () => result.current.startFix() );

			await waitFor( () => {
				expect( mockFetchFixThreatsStatus ).toHaveBeenCalled();
			} );

			expect( result.current.status.isComplete ).toBe( false );
			expect( result.current.status.allFixed ).toBe( false );
		} );

		it( 'should return isComplete true and allFixed true when all threats are fixed', async () => {
			mockFetchFixThreatsStatus.mockResolvedValue(
				createFixThreatsStatusResponse( {
					100001: { status: 'fixed' },
					100002: { status: 'fixed' },
					100003: { status: 'fixed' },
				} )
			);

			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			act( () => result.current.startFix() );

			await waitFor( () => {
				expect( mockFetchFixThreatsStatus ).toHaveBeenCalled();
			} );

			expect( result.current.status.isComplete ).toBe( true );
			expect( result.current.status.allFixed ).toBe( true );
		} );

		it( 'should return isComplete true and allFixed false when some threats are not fixed', async () => {
			mockFetchFixThreatsStatus.mockResolvedValue(
				createFixThreatsStatusResponse( {
					100001: { status: 'fixed' },
					100002: { status: 'not_fixed' },
					100003: { status: 'fixed' },
				} )
			);

			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			act( () => result.current.startFix() );

			await waitFor( () => {
				expect( mockFetchFixThreatsStatus ).toHaveBeenCalled();
			} );

			expect( result.current.status.isComplete ).toBe( true );
			expect( result.current.status.allFixed ).toBe( false );
		} );

		it( 'should return isComplete true and allFixed false when all threats are not fixed', async () => {
			mockFetchFixThreatsStatus.mockResolvedValue(
				createFixThreatsStatusResponse( {
					100001: { status: 'not_fixed' },
					100002: { status: 'not_fixed' },
					100003: { status: 'not_fixed' },
				} )
			);

			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			act( () => result.current.startFix() );

			await waitFor( () => {
				expect( mockFetchFixThreatsStatus ).toHaveBeenCalled();
			} );

			expect( result.current.status.isComplete ).toBe( true );
			expect( result.current.status.allFixed ).toBe( false );
		} );

		it( 'should return isComplete false when threats are not started', async () => {
			mockFetchFixThreatsStatus.mockResolvedValue(
				createFixThreatsStatusResponse( {
					100001: { status: 'not_started' },
					100002: { status: 'not_started' },
					100003: { status: 'not_started' },
				} )
			);

			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			act( () => result.current.startFix() );

			await waitFor( () => {
				expect( mockFetchFixThreatsStatus ).toHaveBeenCalled();
			} );

			expect( result.current.status.isComplete ).toBe( false );
			expect( result.current.status.allFixed ).toBe( false );
		} );
	} );

	describe( 'completion handling', () => {
		it( 'should stop fixing when all threats are complete', async () => {
			mockFetchFixThreatsStatus.mockResolvedValue(
				createFixThreatsStatusResponse( {
					100001: { status: 'fixed' },
					100002: { status: 'fixed' },
					100003: { status: 'fixed' },
				} )
			);

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
		it( 'should call fetchFixThreatsStatus when fixing is in progress', async () => {
			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			act( () => result.current.startFix() );

			await waitFor( () => {
				expect( mockFetchFixThreatsStatus ).toHaveBeenCalledWith( mockSiteId, mockThreatIds );
			} );
		} );

		it( 'should not call fetchFixThreatsStatus when not fixing', () => {
			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			expect( result.current.isFixing ).toBe( false );
			expect( mockFetchFixThreatsStatus ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'error handling', () => {
		it( 'should reset to idle state when mutation fails', async () => {
			mockFixThreats.mockRejectedValue( new Error( 'API Error' ) );

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

		it( 'should handle malformed API response', async () => {
			mockFetchFixThreatsStatus.mockResolvedValue( {
				ok: true,
				threats: null,
			} as unknown as FixThreatsStatusResponse );

			const { result } = renderHook( () => useFixThreats( mockSiteId, mockThreatIds ), {
				wrapper: TestWrapper,
			} );

			act( () => result.current.startFix() );

			await waitFor( () => {
				expect( mockFetchFixThreatsStatus ).toHaveBeenCalled();
			} );

			expect( result.current.status.isComplete ).toBe( false );
			expect( result.current.status.allFixed ).toBe( false );
		} );
	} );
} );
