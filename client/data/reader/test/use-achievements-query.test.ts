/**
 * @jest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import { renderHook } from '@testing-library/react';
import { useAchievementsQuery } from '../use-achievements-query';

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

describe( 'useAchievementsQuery', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIsEnabled.mockReturnValue( true );
		mockUseInfiniteQuery.mockReturnValue( { data: undefined, isLoading: false } );
	} );

	test( 'should not fire a query when feature flag is disabled', () => {
		mockIsEnabled.mockReturnValue( false );

		renderHook( () => useAchievementsQuery( 'testuser' ) );

		expect( mockUseInfiniteQuery ).toHaveBeenCalledWith(
			expect.objectContaining( { enabled: false } )
		);
	} );

	test( 'should not fire a query when userIdOrLogin is undefined', () => {
		renderHook( () => useAchievementsQuery( undefined ) );

		expect( mockUseInfiniteQuery ).toHaveBeenCalledWith(
			expect.objectContaining( { enabled: false } )
		);
	} );

	test( 'should return yearsOfService from the first page', () => {
		mockUseInfiniteQuery.mockReturnValue( {
			data: { pages: [ { found: 5, achievements: [], years_of_service: 7 } ] },
			isLoading: false,
		} );

		const { result } = renderHook( () => useAchievementsQuery( 'testuser' ) );

		expect( result.current.yearsOfService ).toBe( 7 );
	} );

	test( 'should return achievements flattened across pages', () => {
		mockUseInfiniteQuery.mockReturnValue( {
			data: {
				pages: [
					{ found: 3, achievements: [ { achievement_id: 1 } ] },
					{ found: 3, achievements: [ { achievement_id: 2 }, { achievement_id: 3 } ] },
				],
			},
			isLoading: false,
		} );

		const { result } = renderHook( () => useAchievementsQuery( 'testuser' ) );

		expect( result.current.achievements ).toHaveLength( 3 );
		expect( result.current.found ).toBe( 3 );
	} );

	test( 'should return undefined yearsOfService when not in response', () => {
		mockUseInfiniteQuery.mockReturnValue( {
			data: { pages: [ { found: 0, achievements: [] } ] },
			isLoading: false,
		} );

		const { result } = renderHook( () => useAchievementsQuery( 'testuser' ) );

		expect( result.current.yearsOfService ).toBeUndefined();
	} );

	test( 'should return isLoading true while query is loading', () => {
		mockUseInfiniteQuery.mockReturnValue( { data: undefined, isLoading: true } );

		const { result } = renderHook( () => useAchievementsQuery( 'testuser' ) );

		expect( result.current.isLoading ).toBe( true );
	} );
} );
