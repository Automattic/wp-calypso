/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import useAchievementsVisibility from '../use-achievements-visibility';

const mockUseQuery = jest.fn();
jest.mock( '@tanstack/react-query', () => ( {
	useQuery: ( options: unknown ) => mockUseQuery( options ),
} ) );

jest.mock( '@automattic/api-queries', () => ( {
	readAchievementsSettingsQuery: ( userIdOrLogin: string ) => ( {
		queryKey: [ 'read', 'achievements', userIdOrLogin, 'settings' ],
	} ),
} ) );

const mockGetCurrentUser = jest.fn();
jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
} ) );
jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUser: ( state: unknown ) => mockGetCurrentUser( state ),
} ) );

type QueryOptions = { queryKey: unknown[]; enabled?: boolean };
type QueryResult = { data?: unknown; isLoading?: boolean };

function setupUseQuery( response: QueryResult = {} ) {
	mockUseQuery.mockImplementation( ( options: QueryOptions ) => {
		if ( options.enabled === false ) {
			return { data: undefined, isLoading: false };
		}
		return { data: response.data, isLoading: response.isLoading ?? false };
	} );
}

function findCall( mock: jest.Mock, predicate: ( options: QueryOptions ) => boolean ) {
	return mock.mock.calls.find( ( [ options ] ) => predicate( options as QueryOptions ) ) as
		| [ QueryOptions ]
		| undefined;
}

describe( 'useAchievementsVisibility', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockGetCurrentUser.mockReturnValue( { username: 'myself' } );
		setupUseQuery();
	} );

	test( 'returns isOwnProfile and isVisible true for own profile', () => {
		const { result } = renderHook( () => useAchievementsVisibility( 'myself' ) );

		expect( result.current.isOwnProfile ).toBe( true );
		expect( result.current.isVisible ).toBe( true );
		expect( result.current.isLoading ).toBe( false );
	} );

	test( 'does not fetch settings for own profile', () => {
		renderHook( () => useAchievementsVisibility( 'myself' ) );

		const settingsCall = findCall( mockUseQuery, ( o ) => o.queryKey[ 1 ] === 'achievements' );
		expect( settingsCall?.[ 0 ].enabled ).toBe( false );
	} );

	test( 'does not fetch settings when profileUserLogin is undefined', () => {
		renderHook( () => useAchievementsVisibility( undefined ) );

		const settingsCall = findCall( mockUseQuery, ( o ) => o.queryKey[ 1 ] === 'achievements' );
		expect( settingsCall?.[ 0 ].enabled ).toBe( false );
	} );

	test( 'returns isVisible true when other user has public achievements', () => {
		setupUseQuery( {
			data: { settings: { 'achievements-visibility': 'public' } },
		} );

		const { result } = renderHook( () => useAchievementsVisibility( 'other_user' ) );

		expect( result.current.isOwnProfile ).toBe( false );
		expect( result.current.isVisible ).toBe( true );
		expect( result.current.isLoading ).toBe( false );
	} );

	test( 'returns isVisible false when other user has private achievements', () => {
		setupUseQuery( {
			data: { settings: { 'achievements-visibility': 'private' } },
		} );

		const { result } = renderHook( () => useAchievementsVisibility( 'other_user' ) );

		expect( result.current.isOwnProfile ).toBe( false );
		expect( result.current.isVisible ).toBe( false );
	} );

	test( 'returns isLoading true while fetching other user settings', () => {
		setupUseQuery( { isLoading: true } );

		const { result } = renderHook( () => useAchievementsVisibility( 'other_user' ) );

		expect( result.current.isLoading ).toBe( true );
		expect( result.current.isVisible ).toBe( false );
	} );
} );
