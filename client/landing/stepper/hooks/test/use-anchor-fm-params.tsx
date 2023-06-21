/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { MemoryRouter as Router } from 'react-router-dom';
import { useAnchorFmParams } from '../use-anchor-fm-params';

describe( 'use-anchor-fm-params tests', () => {
	const RouteWrapper: React.FC = ( props: { children?: React.ReactNode; path: string } ) => (
		<Router initialEntries={ [ props.path ] }>{ props.children }</Router>
	);

	test( 'Returns anchor podcast ID', async () => {
		const { result } = renderHook( () => useAnchorFmParams(), {
			wrapper: RouteWrapper,
			initialProps: { path: '?anchor_podcast=e1fab2c' },
		} );
		expect( result.current.anchorFmPodcastId ).toEqual( 'e1fab2c' );
	} );

	test( 'Returns episode ID', async () => {
		const { result } = renderHook( () => useAnchorFmParams(), {
			wrapper: RouteWrapper,
			initialProps: { path: '?anchor_episode=12345' },
		} );
		expect( result.current.anchorFmEpisodeId ).toEqual( '12345' );
	} );

	test( 'Returns new site flag value', async () => {
		const { result } = renderHook( () => useAnchorFmParams(), {
			wrapper: RouteWrapper,
			initialProps: { path: '?anchor_is_new_site=true' },
		} );
		expect( result.current.anchorFmIsNewSite ).toEqual( 'true' );
	} );

	test( 'Returns Spotify URL', async () => {
		const { result } = renderHook( () => useAnchorFmParams(), {
			wrapper: RouteWrapper,
			initialProps: { path: '?spotify_url=https://wordpress.com' },
		} );
		expect( result.current.anchorFmSpotifyUrl ).toEqual( 'https://wordpress.com' );
	} );

	test( 'Returns an error for malformed podcast ID', () => {
		const { result } = renderHook( () => useAnchorFmParams(), {
			wrapper: RouteWrapper,
			initialProps: { path: '?anchor_podcast=zzz' },
		} );
		expect( result.current.isAnchorFmPodcastIdError ).toEqual( true );
	} );
} );
