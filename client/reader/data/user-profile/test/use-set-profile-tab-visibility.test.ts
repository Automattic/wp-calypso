/**
 * @jest-environment jsdom
 */
import { rawUserPreferencesQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import nock from 'nock';
import { createElement } from 'react';
import { useSetProfileTabVisibility } from '../use-set-profile-tab-visibility';
import type { UserPreferences } from '@automattic/api-core';

const mockDispatch = jest.fn();
jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
} ) );

const mockRecordTracks = jest.fn();
jest.mock( 'calypso/state/reader/analytics/useRecordReaderTracksEvent', () => ( {
	useRecordReaderTracksEvent: () => mockRecordTracks,
} ) );

describe( 'useSetProfileTabVisibility', () => {
	let queryClient: QueryClient;

	beforeEach( () => {
		jest.clearAllMocks();
		nock.disableNetConnect();
		queryClient = new QueryClient( {
			defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
		} );
		queryClient.setQueryData< UserPreferences >( rawUserPreferencesQuery().queryKey, {
			'reader-profile-posts-visibility': 'public',
			'reader-profile-sites-visibility': 'public',
		} );
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	function wrapper( { children }: { children: React.ReactNode } ) {
		return createElement( QueryClientProvider, { client: queryClient }, children );
	}

	const getPref = ( key: keyof UserPreferences ) =>
		queryClient.getQueryData< UserPreferences >( rawUserPreferencesQuery().queryKey )?.[ key ];

	it( 'optimistically patches the active query client so the tabs update immediately', () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/preferences' )
			.reply( 200, { calypso_preferences: {} } );

		const { result } = renderHook( () => useSetProfileTabVisibility(), { wrapper } );

		act( () => {
			result.current.setVisibility( 'sites', 'hidden' );
		} );

		// Reflected synchronously, before the network request resolves.
		expect( getPref( 'reader-profile-sites-visibility' ) ).toBe( 'hidden' );
	} );

	it( 'rolls back the optimistic patch and notifies on error', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/preferences' )
			.reply( 500, { error: 'nope' } );

		const { result } = renderHook( () => useSetProfileTabVisibility(), { wrapper } );

		act( () => {
			result.current.setVisibility( 'posts', 'hidden' );
		} );
		expect( getPref( 'reader-profile-posts-visibility' ) ).toBe( 'hidden' );

		await waitFor( () => expect( getPref( 'reader-profile-posts-visibility' ) ).toBe( 'public' ) );
		expect( mockDispatch ).toHaveBeenCalled();
	} );
} );
