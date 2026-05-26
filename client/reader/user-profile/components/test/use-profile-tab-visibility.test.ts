/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import useProfileTabVisibility from '../use-profile-tab-visibility';

const mockUseQuery = jest.fn();
jest.mock( '@tanstack/react-query', () => ( {
	useQuery: ( options: unknown ) => mockUseQuery( options ),
} ) );

jest.mock( '@automattic/api-queries', () => ( {
	readProfileSettingsQuery: ( userIdOrLogin?: string ) => ( {
		queryKey: [ 'read', 'users', userIdOrLogin, 'profile-settings' ],
		enabled: userIdOrLogin != null,
	} ),
} ) );

const mockGetCurrentUser = jest.fn();
jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
} ) );
jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUser: ( state: unknown ) => mockGetCurrentUser( state ),
} ) );

type QueryOptions = { enabled?: boolean };
type QueryResult = { data?: unknown; isLoading?: boolean };

function setupUseQuery( response: QueryResult = {} ) {
	mockUseQuery.mockImplementation( ( options: QueryOptions ) => {
		if ( options.enabled === false ) {
			return { data: undefined, isLoading: false };
		}
		return { data: response.data, isLoading: response.isLoading ?? false };
	} );
}

describe( 'useProfileTabVisibility', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockGetCurrentUser.mockReturnValue( { username: 'myself' } );
		setupUseQuery();
	} );

	test( 'returns isOwnProfile true when current user matches profile', () => {
		const { result } = renderHook( () => useProfileTabVisibility( 'myself' ) );

		expect( result.current.isOwnProfile ).toBe( true );
	} );

	test( 'returns isOwnProfile false for another user', () => {
		const { result } = renderHook( () => useProfileTabVisibility( 'other_user' ) );

		expect( result.current.isOwnProfile ).toBe( false );
	} );

	test( 'defaults showPosts and showSites to true while loading', () => {
		setupUseQuery( { isLoading: true } );

		const { result } = renderHook( () => useProfileTabVisibility( 'someone' ) );

		expect( result.current.showPosts ).toBe( true );
		expect( result.current.showSites ).toBe( true );
		expect( result.current.isLoading ).toBe( true );
	} );

	test( 'reads showPosts/showSites from settings when not hidden', () => {
		setupUseQuery( {
			data: {
				settings: {
					'reader-profile-posts-visibility': 'public',
					'reader-profile-sites-visibility': 'public',
				},
			},
		} );

		const { result } = renderHook( () => useProfileTabVisibility( 'someone' ) );

		expect( result.current.showPosts ).toBe( true );
		expect( result.current.showSites ).toBe( true );
	} );

	test( 'returns showPosts false when posts visibility is hidden', () => {
		setupUseQuery( {
			data: {
				settings: {
					'reader-profile-posts-visibility': 'hidden',
					'reader-profile-sites-visibility': 'public',
				},
			},
		} );

		const { result } = renderHook( () => useProfileTabVisibility( 'someone' ) );

		expect( result.current.showPosts ).toBe( false );
		expect( result.current.showSites ).toBe( true );
	} );

	test( 'returns showSites false when sites visibility is hidden', () => {
		setupUseQuery( {
			data: {
				settings: {
					'reader-profile-posts-visibility': 'public',
					'reader-profile-sites-visibility': 'hidden',
				},
			},
		} );

		const { result } = renderHook( () => useProfileTabVisibility( 'someone' ) );

		expect( result.current.showPosts ).toBe( true );
		expect( result.current.showSites ).toBe( false );
	} );

	test( 'isLoading is false when profileUserLogin is undefined', () => {
		setupUseQuery( { isLoading: true } );

		const { result } = renderHook( () => useProfileTabVisibility( undefined ) );

		expect( result.current.isLoading ).toBe( false );
	} );
} );
