/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import useAchievementsVisibility from '../use-achievements-visibility';

const mockIsEnabled = jest.fn();
jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: ( ...args: unknown[] ) => mockIsEnabled( ...args ),
} ) );

const mockUseQuery = jest.fn();
jest.mock( '@tanstack/react-query', () => ( {
	useQuery: ( options: unknown ) => mockUseQuery( options ),
} ) );

jest.mock( '@automattic/api-queries', () => ( {
	readAchievementsSettingsQuery: ( userIdOrLogin: string ) => ( {
		queryKey: [ 'read', 'achievements', userIdOrLogin, 'settings' ],
	} ),
	readTeamsQuery: () => ( { queryKey: [ 'read', 'teams' ] } ),
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
type QueryResponses = { teams?: QueryResult; settings?: QueryResult };

function setupUseQuery( responses: QueryResponses = {} ) {
	mockUseQuery.mockImplementation( ( options: QueryOptions ) => {
		if ( options.enabled === false ) {
			return { data: undefined, isLoading: false };
		}
		const isTeams = options.queryKey[ 1 ] === 'teams';
		const response = ( isTeams ? responses.teams : responses.settings ) ?? {};
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
		mockIsEnabled.mockReturnValue( true );
		mockGetCurrentUser.mockReturnValue( { username: 'myself' } );
		setupUseQuery( {
			teams: { data: { teams: [ { slug: 'a8c' } ] } },
		} );
	} );

	test( 'returns isVisible false when feature flag is disabled', () => {
		mockIsEnabled.mockReturnValue( false );

		const { result } = renderHook( () => useAchievementsVisibility( 'myself' ) );

		expect( result.current.isVisible ).toBe( false );
		expect( result.current.isLoading ).toBe( false );
	} );

	test( 'does not fetch teams or settings when flag is disabled', () => {
		mockIsEnabled.mockReturnValue( false );

		renderHook( () => useAchievementsVisibility( 'other_user' ) );

		const teamsCall = findCall( mockUseQuery, ( o ) => o.queryKey[ 1 ] === 'teams' );
		const settingsCall = findCall( mockUseQuery, ( o ) => o.queryKey[ 1 ] === 'achievements' );
		expect( teamsCall?.[ 0 ].enabled ).toBe( false );
		expect( settingsCall?.[ 0 ].enabled ).toBe( false );
	} );

	test( 'returns isLoading true while teams query loads', () => {
		setupUseQuery( {
			teams: { isLoading: true },
		} );

		const { result } = renderHook( () => useAchievementsVisibility( 'myself' ) );

		expect( result.current.isLoading ).toBe( true );
		expect( result.current.isVisible ).toBe( false );
	} );

	test( 'returns isVisible false when viewer is not an automattician', () => {
		setupUseQuery( {
			teams: { data: { teams: [] } },
			settings: { data: { settings: { 'achievements-visibility': 'public' } } },
		} );

		const { result } = renderHook( () => useAchievementsVisibility( 'myself' ) );

		expect( result.current.isVisible ).toBe( false );
		expect( result.current.isLoading ).toBe( false );
	} );

	test( 'does not fetch settings when viewer is not an automattician', () => {
		setupUseQuery( {
			teams: { data: { teams: [] } },
		} );

		renderHook( () => useAchievementsVisibility( 'other_user' ) );

		const settingsCall = findCall( mockUseQuery, ( o ) => o.queryKey[ 1 ] === 'achievements' );
		expect( settingsCall?.[ 0 ].enabled ).toBe( false );
	} );

	test( 'returns isOwnProfile and isVisible true for own profile when viewer is A8C', () => {
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

	test( 'returns isVisible true when other user has public achievements and viewer is A8C', () => {
		setupUseQuery( {
			teams: { data: { teams: [ { slug: 'a8c' } ] } },
			settings: { data: { settings: { 'achievements-visibility': 'public' } } },
		} );

		const { result } = renderHook( () => useAchievementsVisibility( 'other_user' ) );

		expect( result.current.isOwnProfile ).toBe( false );
		expect( result.current.isVisible ).toBe( true );
		expect( result.current.isLoading ).toBe( false );
	} );

	test( 'returns isVisible false when other user has private achievements', () => {
		setupUseQuery( {
			teams: { data: { teams: [ { slug: 'a8c' } ] } },
			settings: { data: { settings: { 'achievements-visibility': 'private' } } },
		} );

		const { result } = renderHook( () => useAchievementsVisibility( 'other_user' ) );

		expect( result.current.isOwnProfile ).toBe( false );
		expect( result.current.isVisible ).toBe( false );
	} );

	test( 'returns isLoading true while fetching other user settings', () => {
		setupUseQuery( {
			teams: { data: { teams: [ { slug: 'a8c' } ] } },
			settings: { isLoading: true },
		} );

		const { result } = renderHook( () => useAchievementsVisibility( 'other_user' ) );

		expect( result.current.isLoading ).toBe( true );
		expect( result.current.isVisible ).toBe( false );
	} );
} );
