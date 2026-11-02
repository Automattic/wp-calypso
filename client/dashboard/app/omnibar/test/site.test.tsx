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
import { useSyncOmnibarSite } from '../site';
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

	test( 'removes the origin_site_id param a wp-admin link adds, and keeps the history entry', async () => {
		window.history.replaceState( null, '', '/sites/foo?origin_site_id=123&keep=1' );
		const { length } = window.history;

		const router = renderRouterWithSiteRoute( { ID: 456, capabilities: {} } as Site );
		await screen.findByText( 'site' );

		await waitFor( () => expect( window.location.search ).toBe( '?keep=1' ) );
		expect( router.state.location.search ).toEqual( { keep: 1 } );
		expect( window.history.length ).toBe( length );
		expect( window.history.state ).toMatchObject( { __TSR_index: 0 } );
		expect( queryClient.getQueryData( omnibarSiteIdQuery().queryKey ) ).toBe( 456 );
	} );
} );
