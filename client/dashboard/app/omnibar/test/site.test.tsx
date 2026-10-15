/**
 * @jest-environment jsdom
 */
import { omnibarSiteIdQuery, queryClient, rawUserPreferencesQuery } from '@automattic/api-queries';
import {
	Outlet,
	RouterProvider,
	createRootRoute,
	createRoute,
	createRouter,
} from '@tanstack/react-router';
import { act, render as testingLibraryRender, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import { AUTH_QUERY_KEY } from '../../auth';
import { useSyncOmnibarSite } from '../site';
import type { Site, User, UserPreferences } from '@automattic/api-core';

function OmnibarProbe() {
	useSyncOmnibarSite();
	return null;
}

// The shared `render()` has no route loader, so a site-bearing route needs its own router.
function renderRouterWithSiteRoute( site: Site ) {
	function RootComponent() {
		useSyncOmnibarSite();
		return <Outlet />;
	}

	const rootRoute = createRootRoute( { component: RootComponent } );
	const indexRoute = createRoute( {
		getParentRoute: () => rootRoute,
		path: '/',
		component: () => <div>home</div>,
	} );
	const siteRoute = createRoute( {
		getParentRoute: () => rootRoute,
		path: '/sites/$slug',
		loader: () => ( { site } ),
		component: () => <div>site</div>,
	} );
	const router = createRouter( { routeTree: rootRoute.addChildren( [ indexRoute, siteRoute ] ) } );

	testingLibraryRender( <RouterProvider router={ router } /> );

	return router;
}

// Flush pending microtasks/effects so a hypothetical re-triggered write would fire.
function flush() {
	return act( async () => {} );
}

describe( 'useSyncOmnibarSite', () => {
	afterEach( () => {
		queryClient.clear();
	} );

	test( 'records the recent site only once when the preference write keeps failing', async () => {
		queryClient.setQueryData( AUTH_QUERY_KEY, { ID: 1, primary_blog: 123 } as User );

		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/rest/v1.1/me/preferences' )
			.reply( 200, { calypso_preferences: { recentSites: [ 999 ] } } );

		// Sites are returned without `capabilities`, so they aren't treated as
		// member sites and the omnibar falls back to the user's primary blog.
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( /\/rest\/v1\.1\/sites\/\d+/ )
			.query( true )
			.reply( 200, ( uri ) => ( { ID: Number( uri.match( /sites\/(\d+)/ )?.[ 1 ] ) } ) );

		// The failure path logs to logstash.
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.post( '/rest/v1.1/logstash' )
			.reply( 200, {} );

		// The recent-sites write always fails. Before the fix, the optimistic
		// mutation's rollback changed `recentSites`, re-triggering the effect that
		// fired the write, so it retried forever.
		let postCount = 0;
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.post( '/rest/v1.1/me/preferences' )
			.reply( () => {
				postCount += 1;
				return [ 405, { error: 'not_allowed' } ];
			} );

		render( <OmnibarProbe /> );

		// The write is attempted (optimistically setting `recentSites` to `[ 123, 999 ]`)…
		await waitFor( () => expect( postCount ).toBe( 1 ) );
		// …then fails and rolls `recentSites` back to `[ 999 ]`. That rollback is the
		// exact event the old bug re-fired the write from; once it settles, no retry.
		await waitFor( () =>
			expect(
				queryClient.getQueryData< UserPreferences >( rawUserPreferencesQuery().queryKey )
					?.recentSites
			).toEqual( [ 999 ] )
		);
		await flush();

		expect( postCount ).toBe( 1 );

		// The omnibar still resolves to the primary blog and publishes it as shared state.
		expect( queryClient.getQueryData( omnibarSiteIdQuery().queryKey ) ).toBe( 123 );
	} );

	test( 'publishes the route site before the asynchronous candidates resolve', async () => {
		queryClient.setQueryData( AUTH_QUERY_KEY, { ID: 1, primary_blog: 123 } as User );
		// The site the omnibar was showing before this navigation.
		queryClient.setQueryData( omnibarSiteIdQuery().queryKey, 111 );

		// Reading preferences fails, so the resolution that awaits them bails out and
		// anything published here can only have come from the route.
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/rest/v1.1/me/preferences' )
			.reply( 403, { error: 'unauthorized' } );

		const router = renderRouterWithSiteRoute( { ID: 456, capabilities: {} } as Site );
		await waitFor( () => expect( document.body.textContent ).toContain( 'home' ) );

		router.navigate( { to: '/sites/$slug', params: { slug: 'foo' } } );
		await waitFor( () => expect( document.body.textContent ).toContain( 'site' ) );

		// Events recorded in this window — a Help click right after landing — must
		// attribute the site being visited, not the one left behind.
		await waitFor( () =>
			expect( queryClient.getQueryData( omnibarSiteIdQuery().queryKey ) ).toBe( 456 )
		);
		await waitFor( () =>
			expect( queryClient.getQueryState( rawUserPreferencesQuery().queryKey )?.status ).toBe(
				'error'
			)
		);
		await flush();

		expect( queryClient.getQueryData( omnibarSiteIdQuery().queryKey ) ).toBe( 456 );
	} );

	test( 'does not attempt a write when reading preferences fails', async () => {
		queryClient.setQueryData( AUTH_QUERY_KEY, { ID: 1, primary_blog: 123 } as User );

		// Reading preferences fails, so a write would likely fail too — we bail out.
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/rest/v1.1/me/preferences' )
			.reply( 403, { error: 'unauthorized' } );

		let postCount = 0;
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.post( '/rest/v1.1/me/preferences' )
			.reply( () => {
				postCount += 1;
				return [ 200, {} ];
			} );

		render( <OmnibarProbe /> );

		// Wait for the preferences read to fail, then confirm no write followed.
		await waitFor( () =>
			expect( queryClient.getQueryState( rawUserPreferencesQuery().queryKey )?.status ).toBe(
				'error'
			)
		);
		await flush();

		expect( postCount ).toBe( 0 );
	} );
} );
