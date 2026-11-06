/**
 * @jest-environment jsdom
 */
import { omnibarSiteIdQuery, queryClient } from '@automattic/api-queries';
import {
	Outlet,
	RouterProvider,
	createRootRoute,
	createRoute,
	createRouter,
} from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import { removeOriginSiteIdParam, useSyncOmnibarSite } from '../site';
import type { Site } from '@automattic/api-core';

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

	render( <RouterProvider router={ router } /> );

	return router;
}

describe( 'useSyncOmnibarSite', () => {
	afterEach( () => {
		queryClient.clear();
		window.history.replaceState( null, '', '/' );
	} );

	test( 'publishes the route site, and clears it on pages that are not site-specific', async () => {
		const router = renderRouterWithSiteRoute( { ID: 456, capabilities: {} } as Site );
		await screen.findByText( 'home' );

		expect( queryClient.getQueryData( omnibarSiteIdQuery().queryKey ) ).toBeNull();

		router.navigate( { to: '/sites/$slug', params: { slug: 'foo' } } );
		await screen.findByText( 'site' );

		await waitFor( () =>
			expect( queryClient.getQueryData( omnibarSiteIdQuery().queryKey ) ).toBe( 456 )
		);

		router.navigate( { to: '/' } );
		await screen.findByText( 'home' );

		await waitFor( () =>
			expect( queryClient.getQueryData( omnibarSiteIdQuery().queryKey ) ).toBeNull()
		);
	} );
} );

describe( 'removeOriginSiteIdParam', () => {
	afterEach( () => {
		window.history.replaceState( null, '', '/' );
	} );

	test( 'removes the origin_site_id param a wp-admin link adds, and keeps the rest of the URL', () => {
		window.history.replaceState( { key: 'abc' }, '', '/sites/foo?origin_site_id=123&keep=1#top' );
		const { length } = window.history;

		removeOriginSiteIdParam();

		expect( window.location.pathname + window.location.search + window.location.hash ).toBe(
			'/sites/foo?keep=1#top'
		);
		expect( window.history.length ).toBe( length );
		expect( window.history.state ).toEqual( { key: 'abc' } );
	} );

	test.each( [
		[ '?origin_site_id=123&a=b=c', '?a=b=c' ],
		[ '?a=1&origin_site_id=123&b=x%3Dy%26z', '?a=1&b=x%3Dy%26z' ],
		[ '?search=My%20Site&origin_site_id=123', '?search=My%20Site' ],
		[ '?origin_site_id=1&a=1&origin%5Fsite%5Fid=2', '?a=1' ],
		[ '?origin_site_id=123', '' ],
	] )( 'leaves the rest of %s as written', ( search, expected ) => {
		window.history.replaceState( null, '', '/sites' + search );

		removeOriginSiteIdParam();

		expect( window.location.search ).toBe( expected );
	} );

	test( 'leaves spaces for the router to read', () => {
		window.history.replaceState( null, '', '/?origin_site_id=123&search=My%20Site' );

		removeOriginSiteIdParam();

		const router = createRouter( { routeTree: createRootRoute() } );
		expect( router.state.location.search ).toEqual( { search: 'My Site' } );
	} );
} );
