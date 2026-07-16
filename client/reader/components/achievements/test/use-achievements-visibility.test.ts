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
	userPreferenceQuery: ( preferenceName: string ) => ( {
		queryKey: [ 'me', 'preferences', preferenceName ],
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

function setupUseQuery( {
	settings = {},
	preference = {},
}: {
	settings?: QueryResult;
	preference?: QueryResult;
} = {} ) {
	mockUseQuery.mockImplementation( ( options: QueryOptions ) => {
		if ( options.enabled === false ) {
			return { data: undefined, isLoading: false };
		}
		if ( options.queryKey[ 0 ] === 'read' ) {
			return { data: settings.data, isLoading: settings.isLoading ?? false };
		}
		if ( options.queryKey[ 0 ] === 'me' ) {
			return { data: preference.data, isLoading: preference.isLoading ?? false };
		}
		return { data: undefined, isLoading: false };
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
		expect( result.current.isPublic ).toBe( false );
		expect( result.current.isLoading ).toBe( false );
	} );

	test( 'does not fetch public settings for own profile', () => {
		renderHook( () => useAchievementsVisibility( 'myself' ) );

		const settingsCall = findCall( mockUseQuery, ( o ) => o.queryKey[ 1 ] === 'achievements' );
		expect( settingsCall?.[ 0 ].enabled ).toBe( false );
	} );

	test( 'fetches own preference for own profile', () => {
		renderHook( () => useAchievementsVisibility( 'myself' ) );

		const preferenceCall = findCall(
			mockUseQuery,
			( o ) => o.queryKey[ 0 ] === 'me' && o.queryKey[ 2 ] === 'achievements-visibility'
		);
		expect( preferenceCall?.[ 0 ].enabled ).toBe( true );
	} );

	test( 'returns isPublic true when own achievements preference is public', () => {
		setupUseQuery( { preference: { data: 'public' } } );

		const { result } = renderHook( () => useAchievementsVisibility( 'myself' ) );

		expect( result.current.isOwnProfile ).toBe( true );
		expect( result.current.isPublic ).toBe( true );
		expect( result.current.isVisible ).toBe( true );
		expect( result.current.isLoading ).toBe( false );
	} );

	test( 'still shows own profile when own achievements preference is private', () => {
		setupUseQuery( { preference: { data: 'private' } } );

		const { result } = renderHook( () => useAchievementsVisibility( 'myself' ) );

		expect( result.current.isOwnProfile ).toBe( true );
		expect( result.current.isPublic ).toBe( false );
		expect( result.current.isVisible ).toBe( true );
		expect( result.current.isLoading ).toBe( false );
	} );

	test( 'does not fetch settings when profileUserLogin is undefined', () => {
		renderHook( () => useAchievementsVisibility( undefined ) );

		const settingsCall = findCall( mockUseQuery, ( o ) => o.queryKey[ 1 ] === 'achievements' );
		expect( settingsCall?.[ 0 ].enabled ).toBe( false );
	} );

	test( 'returns isVisible true when other user has public achievements', () => {
		setupUseQuery( {
			settings: { data: { settings: { 'achievements-visibility': 'public' } } },
		} );

		const { result } = renderHook( () => useAchievementsVisibility( 'other_user' ) );

		expect( result.current.isOwnProfile ).toBe( false );
		expect( result.current.isPublic ).toBe( true );
		expect( result.current.isVisible ).toBe( true );
		expect( result.current.isLoading ).toBe( false );
	} );

	test( 'returns isVisible false when other user has private achievements', () => {
		setupUseQuery( {
			settings: { data: { settings: { 'achievements-visibility': 'private' } } },
		} );

		const { result } = renderHook( () => useAchievementsVisibility( 'other_user' ) );

		expect( result.current.isOwnProfile ).toBe( false );
		expect( result.current.isPublic ).toBe( false );
		expect( result.current.isVisible ).toBe( false );
	} );

	test( 'does not fetch own preference for other user profile', () => {
		renderHook( () => useAchievementsVisibility( 'other_user' ) );

		const preferenceCall = findCall(
			mockUseQuery,
			( o ) => o.queryKey[ 0 ] === 'me' && o.queryKey[ 2 ] === 'achievements-visibility'
		);
		expect( preferenceCall?.[ 0 ].enabled ).toBe( false );
	} );

	test( 'returns isLoading true while fetching other user settings', () => {
		setupUseQuery( { settings: { isLoading: true } } );

		const { result } = renderHook( () => useAchievementsVisibility( 'other_user' ) );

		expect( result.current.isLoading ).toBe( true );
		expect( result.current.isPublic ).toBe( false );
		expect( result.current.isVisible ).toBe( false );
	} );
} );
