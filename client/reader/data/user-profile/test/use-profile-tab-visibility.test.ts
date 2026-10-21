/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { createElement } from 'react';
import { useProfileTabVisibility } from '../use-profile-tab-visibility';
import type { ReadProfileSettingsResponse } from '@automattic/api-core';

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
} ) );

describe( 'useProfileTabVisibility', () => {
	const { useSelector } = jest.requireMock( 'calypso/state' );
	let queryClient: QueryClient;

	beforeEach( () => {
		jest.clearAllMocks();
		useSelector.mockReturnValue( null );
		nock.disableNetConnect();
		queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	function wrapper( { children }: { children: React.ReactNode } ) {
		return createElement( QueryClientProvider, { client: queryClient }, children );
	}

	function nockProfileSettings(
		userLogin: string,
		response: ReadProfileSettingsResponse | number
	) {
		const scope = nock( 'https://public-api.wordpress.com' ).get(
			`/wpcom/v2/read/users/${ userLogin }/profile-settings`
		);
		if ( typeof response === 'number' ) {
			return scope.reply( response, { error: 'error', message: 'Error' } );
		}
		return scope.reply( 200, response );
	}

	function nockPreferences( prefs: Record< string, unknown > ) {
		return nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/preferences' )
			.reply( 200, { calypso_preferences: prefs } );
	}

	test( "always shows the owner's own tabs, but reports the hidden ones as not public", async () => {
		useSelector.mockReturnValue( { username: 'me' } );
		nockPreferences( {
			'reader-profile-posts-visibility': 'public',
			'reader-profile-sites-visibility': 'hidden',
		} );

		const { result } = renderHook( () => useProfileTabVisibility( 'me' ), { wrapper } );

		expect( result.current.isOwnProfile ).toBe( true );
		expect( result.current.showSites ).toBe( true );
		expect( result.current.isSitesPublic ).toBe( true );
		expect( result.current.showPosts ).toBe( true );
		expect( result.current.isPostsPublic ).toBe( true );
	} );

	test( 'defaults the owner to all tabs visible and public while preferences load / when unset', () => {
		useSelector.mockReturnValue( { username: 'me' } );
		nockPreferences( {} );

		const { result } = renderHook( () => useProfileTabVisibility( 'me' ), { wrapper } );

		expect( result.current.showPosts ).toBe( true );
		expect( result.current.showSites ).toBe( true );
		expect( result.current.isPostsPublic ).toBe( true );
		expect( result.current.isSitesPublic ).toBe( true );
		// The owner never hits the public profile-settings endpoint.
		expect( nock.pendingMocks().some( ( m ) => m.includes( 'profile-settings' ) ) ).toBe( false );
	} );

	test( 'resolves public visibility from the settings endpoint', async () => {
		nockProfileSettings( 'someone', {
			settings: {
				'reader-profile-posts-visibility': 'public',
				'reader-profile-sites-visibility': 'hidden',
			},
		} );

		const { result } = renderHook( () => useProfileTabVisibility( 'someone' ), { wrapper } );

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
		// For a public viewer, the shown tabs and the public flags agree.
		expect( result.current.showPosts ).toBe( true );
		expect( result.current.isPostsPublic ).toBe( true );
		expect( result.current.showSites ).toBe( false );
		expect( result.current.isSitesPublic ).toBe( false );
	} );

	test( 'defaults to visible while the settings are loading', () => {
		nockProfileSettings( 'someone', {
			settings: {
				'reader-profile-posts-visibility': 'hidden',
				'reader-profile-sites-visibility': 'hidden',
			},
		} );

		const { result } = renderHook( () => useProfileTabVisibility( 'someone' ), { wrapper } );

		expect( result.current.isLoading ).toBe( true );
		expect( result.current.showPosts ).toBe( true );
		expect( result.current.showSites ).toBe( true );
	} );

	test( 'fails closed when the settings request errors', async () => {
		nockProfileSettings( 'someone', 500 );

		const { result } = renderHook( () => useProfileTabVisibility( 'someone' ), { wrapper } );

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
		expect( result.current.showPosts ).toBe( false );
		expect( result.current.showSites ).toBe( false );
		expect( result.current.isPostsPublic ).toBe( false );
		expect( result.current.isSitesPublic ).toBe( false );
	} );

	test( 'still shows the owner the Posts tab when they have hidden it, but reports it as not public', async () => {
		useSelector.mockReturnValue( { username: 'me' } );
		nockPreferences( {
			'reader-profile-posts-visibility': 'hidden',
			'reader-profile-sites-visibility': 'public',
		} );

		const { result } = renderHook( () => useProfileTabVisibility( 'me' ), { wrapper } );

		await waitFor( () => expect( result.current.isPostsPublic ).toBe( false ) );
		expect( result.current.showPosts ).toBe( true );
	} );

	test( 'still shows the owner the Sites tab when they have hidden it, but reports it as not public', async () => {
		useSelector.mockReturnValue( { username: 'me' } );
		nockPreferences( {
			'reader-profile-posts-visibility': 'public',
			'reader-profile-sites-visibility': 'hidden',
		} );

		const { result } = renderHook( () => useProfileTabVisibility( 'me' ), { wrapper } );

		await waitFor( () => expect( result.current.isSitesPublic ).toBe( false ) );
		expect( result.current.showSites ).toBe( true );
	} );
} );
