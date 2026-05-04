/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import useAchievementsVisibility from '../use-achievements-visibility';

const mockUseQuery = jest.fn();
jest.mock( '@tanstack/react-query', () => ( {
	useQuery: ( ...args: unknown[] ) => mockUseQuery( ...args ),
} ) );

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: () => true,
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

describe( 'useAchievementsVisibility', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockUseQuery.mockReturnValue( { data: undefined, isLoading: false } );
	} );

	test( 'should return isOwnProfile and isVisible true for own profile', () => {
		mockGetCurrentUser.mockReturnValue( { username: 'myself' } );

		const { result } = renderHook( () => useAchievementsVisibility( 'myself' ) );

		expect( result.current.isOwnProfile ).toBe( true );
		expect( result.current.isVisible ).toBe( true );
		expect( result.current.isLoading ).toBe( false );
	} );

	test( 'should not fetch settings for own profile', () => {
		mockGetCurrentUser.mockReturnValue( { username: 'myself' } );

		renderHook( () => useAchievementsVisibility( 'myself' ) );

		expect( mockUseQuery ).toHaveBeenCalledWith( expect.objectContaining( { enabled: false } ) );
	} );

	test( 'should return isVisible true when other user has public achievements', () => {
		mockGetCurrentUser.mockReturnValue( { username: 'myself' } );
		mockUseQuery.mockReturnValue( {
			data: { settings: { 'achievements-visibility': 'public' } },
			isLoading: false,
		} );

		const { result } = renderHook( () => useAchievementsVisibility( 'other_user' ) );

		expect( result.current.isOwnProfile ).toBe( false );
		expect( result.current.isVisible ).toBe( true );
		expect( result.current.isLoading ).toBe( false );
	} );

	test( 'should return isVisible false when other user has private achievements', () => {
		mockGetCurrentUser.mockReturnValue( { username: 'myself' } );
		mockUseQuery.mockReturnValue( {
			data: { settings: { 'achievements-visibility': 'private' } },
			isLoading: false,
		} );

		const { result } = renderHook( () => useAchievementsVisibility( 'other_user' ) );

		expect( result.current.isOwnProfile ).toBe( false );
		expect( result.current.isVisible ).toBe( false );
	} );

	test( 'should return isLoading true while fetching other user settings', () => {
		mockGetCurrentUser.mockReturnValue( { username: 'myself' } );
		mockUseQuery.mockReturnValue( { data: undefined, isLoading: true } );

		const { result } = renderHook( () => useAchievementsVisibility( 'other_user' ) );

		expect( result.current.isLoading ).toBe( true );
		expect( result.current.isVisible ).toBe( false );
	} );
} );
