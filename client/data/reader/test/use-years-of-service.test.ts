/**
 * @jest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import { renderHook } from '@testing-library/react';
import { useYearsOfService } from '../use-years-of-service';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );

const mockIsEnabled = isEnabled as jest.MockedFunction< typeof isEnabled >;

const mockUseInfiniteQuery = jest.fn();
jest.mock( '@tanstack/react-query', () => ( {
	useInfiniteQuery: ( ...args: unknown[] ) => mockUseInfiniteQuery( ...args ),
} ) );

jest.mock( '@automattic/api-queries', () => ( {
	readAchievementsQuery: ( userIdOrLogin: string ) => ( {
		queryKey: [ 'read', 'achievements', userIdOrLogin ],
	} ),
} ) );

describe( 'useYearsOfService', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIsEnabled.mockReturnValue( true );
		mockUseInfiniteQuery.mockReturnValue( { data: undefined, isLoading: false } );
	} );

	test( 'should return undefined and not fire a query when feature flag is disabled', () => {
		mockIsEnabled.mockReturnValue( false );

		const { result } = renderHook( () => useYearsOfService( 'testuser' ) );

		expect( result.current.yearsOfService ).toBeUndefined();
		expect( result.current.isLoading ).toBe( false );
		expect( mockUseInfiniteQuery ).toHaveBeenCalledWith(
			expect.objectContaining( { enabled: false } )
		);
	} );

	test( 'should return undefined when data is not loaded', () => {
		mockUseInfiniteQuery.mockReturnValue( { data: undefined, isLoading: false } );

		const { result } = renderHook( () => useYearsOfService( 'testuser' ) );

		expect( result.current.yearsOfService ).toBeUndefined();
		expect( result.current.isLoading ).toBe( false );
	} );

	test( 'should return years_of_service from the first page', () => {
		mockUseInfiniteQuery.mockReturnValue( {
			data: {
				pages: [ { found: 5, achievements: [], years_of_service: 7 } ],
			},
			isLoading: false,
		} );

		const { result } = renderHook( () => useYearsOfService( 'testuser' ) );

		expect( result.current.yearsOfService ).toBe( 7 );
		expect( result.current.isLoading ).toBe( false );
	} );

	test( 'should return isLoading true while query is loading', () => {
		mockUseInfiniteQuery.mockReturnValue( { data: undefined, isLoading: true } );

		const { result } = renderHook( () => useYearsOfService( 'testuser' ) );

		expect( result.current.yearsOfService ).toBeUndefined();
		expect( result.current.isLoading ).toBe( true );
	} );

	test( 'should return undefined when years_of_service is not in the response', () => {
		mockUseInfiniteQuery.mockReturnValue( {
			data: {
				pages: [ { found: 3, achievements: [] } ],
			},
			isLoading: false,
		} );

		const { result } = renderHook( () => useYearsOfService( 'testuser' ) );

		expect( result.current.yearsOfService ).toBeUndefined();
	} );
} );
