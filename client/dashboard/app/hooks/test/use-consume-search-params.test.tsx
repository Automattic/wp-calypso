/**
 * @jest-environment jsdom
 */
import {
	Outlet,
	RouterProvider,
	createRootRoute,
	createRoute,
	createRouter,
	useBlocker,
} from '@tanstack/react-router';
import { act, render, screen, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { dashboardRedirect } from '../../router/redirect';
import { removeSearchParams, useConsumeSearchParams } from '../use-consume-search-params';
import type { AnyRoute } from '@tanstack/react-router';

const onConsume = jest.fn();
const shouldBlock = jest.fn( () => false );

function Flash( { id }: { id: string } ) {
	useConsumeSearchParams( [ 'flash' ], {
		when: ( params ) => params.flash === id,
		onConsume: () => onConsume( id ),
	} );
	return null;
}

function Callback() {
	const { code, state } = useConsumeSearchParams( [ 'code', 'state' ], { onConsume } );
	return <p>{ `code=${ code } state=${ state }` }</p>;
}

function Root() {
	// Like the dashboard root, always register a blocker: it defers history writes.
	useBlocker( { shouldBlockFn: shouldBlock } );
	return <Outlet />;
}

function renderRouter( url: string, routeTree: AnyRoute, { strict = false } = {} ) {
	window.history.replaceState( null, '', url );
	const router = createRouter( { routeTree } );
	const app = <RouterProvider router={ router } />;
	render( strict ? <StrictMode>{ app }</StrictMode> : app );
	return router;
}

function renderPage( url: string, options?: { strict?: boolean } ) {
	const root = createRootRoute( { component: Root } );
	const page = createRoute( {
		getParentRoute: () => root,
		path: '/page',
		component: () => (
			<>
				<Flash id="saved" />
				<Callback />
			</>
		),
	} );
	return renderRouter( url, root.addChildren( [ page ] ), options );
}

const wait = ( ms: number ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) );

beforeEach( () => {
	onConsume.mockClear();
	shouldBlock.mockClear();
} );

describe( 'useConsumeSearchParams', () => {
	test( 'returns the params on load, then removes them from the URL in one replacement', async () => {
		const router = renderPage(
			'/page?flash=saved&code=12345678901234567890&state=%22x%22&keep=1#tab'
		);
		const length = window.history.length;

		expect( await screen.findByText( 'code=12345678901234567890 state="x"' ) ).toBeVisible();
		await waitFor( () => expect( window.location.search ).toBe( '?keep=1' ) );
		expect( window.location.hash ).toBe( '#tab' );
		expect( window.history.length ).toBe( length );
		expect( router.state.location.search ).toEqual( { keep: 1 } );
		expect( onConsume ).toHaveBeenCalledTimes( 2 );
		expect( onConsume ).toHaveBeenCalledWith( 'saved' );
		expect( onConsume ).toHaveBeenCalledWith( { code: '12345678901234567890', state: '"x"' } );
		expect( shouldBlock ).not.toHaveBeenCalled();
	} );

	test( 'leaves params that `when` rejects', async () => {
		renderPage( '/page?flash=other&code=1' );

		await waitFor( () => expect( window.location.search ).toBe( '?flash=other' ) );
		expect( onConsume ).toHaveBeenCalledTimes( 1 );
		expect( onConsume ).not.toHaveBeenCalledWith( 'saved' );
	} );

	test( 'consumes params that arrive while mounted', async () => {
		const router = renderPage( '/page' );
		await waitFor( () => expect( router.state.status ).toBe( 'idle' ) );

		for ( const keep of [ 1, 2 ] ) {
			await act( () => router.navigate( { to: '/page', search: { flash: 'saved', keep } } ) );
			await waitFor( () => expect( window.location.search ).toBe( `?keep=${ keep }` ) );
		}
		expect( onConsume ).toHaveBeenCalledTimes( 2 );

		// The router quotes this value as `%22123%22`.
		await act( () => router.navigate( { to: '/page', search: { code: '123' } } ) );
		expect( await screen.findByText( 'code=123 state=undefined' ) ).toBeVisible();
		await waitFor( () => expect( window.location.search ).toBe( '' ) );
		expect( onConsume ).toHaveBeenLastCalledWith( { code: '123' } );
	} );

	test( 'waits for a redirect that adds the params to resolve before removing them', async () => {
		const root = createRootRoute( { component: Root } );
		const site = createRoute( {
			getParentRoute: () => root,
			path: '/sites/$siteSlug',
			loader: () => wait( 20 ),
			component: function Site() {
				const { siteSlug } = site.useParams();
				return (
					<>
						<Flash key={ siteSlug } id="denied" />
						<p>{ `site=${ siteSlug }` }</p>
						<Outlet />
					</>
				);
			},
		} );
		const settings = createRoute( {
			getParentRoute: () => site,
			path: 'settings',
			beforeLoad: async ( { params } ) => {
				await wait( 10 );
				if ( params.siteSlug === 'bar' ) {
					throw dashboardRedirect( {
						to: '/sites/$siteSlug',
						params,
						search: { flash: 'denied' },
					} );
				}
			},
		} );
		const router = renderRouter(
			'/sites/foo/settings',
			root.addChildren( [ site.addChildren( [ settings ] ) ] )
		);
		expect( await screen.findByText( 'site=foo' ) ).toBeVisible();
		await waitFor( () => expect( router.state.status ).toBe( 'idle' ) );

		await act( () =>
			router.navigate( { to: '/sites/$siteSlug/settings', params: { siteSlug: 'bar' } } )
		);
		await waitFor( () => expect( onConsume ).toHaveBeenCalled() );
		await waitFor( () => expect( window.location.search ).toBe( '' ) );
		expect( window.location.pathname ).toBe( '/sites/bar' );
		expect( screen.getByText( 'site=bar' ) ).toBeVisible();
		expect( onConsume ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'acts once in StrictMode', async () => {
		renderPage( '/page?flash=saved', { strict: true } );

		await waitFor( () => expect( window.location.search ).toBe( '' ) );
		expect( onConsume ).toHaveBeenCalledTimes( 1 );
	} );
} );

describe( 'removeSearchParams', () => {
	test( 'joins removals from the same task into one navigation, and skips absent params', async () => {
		const router = renderPage( '/page?a=1&b=2&keep=1' );
		await waitFor( () => expect( router.state.status ).toBe( 'idle' ) );
		const navigate = jest.spyOn( router, 'navigate' );

		act( () => {
			removeSearchParams( router, [ 'a' ] );
			removeSearchParams( router, [ 'b' ] );
		} );
		await waitFor( () => expect( window.location.search ).toBe( '?keep=1' ) );
		expect( navigate ).toHaveBeenCalledTimes( 1 );

		act( () => removeSearchParams( router, [ 'a' ] ) );
		await act( () => Promise.resolve() );
		expect( navigate ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'waits for a navigation in progress to resolve', async () => {
		const root = createRootRoute( { component: Root } );
		const item = createRoute( {
			getParentRoute: () => root,
			path: '/items/$id',
			loader: () => wait( 20 ),
			component: function Item() {
				return <p>{ `item=${ item.useParams().id }` }</p>;
			},
		} );
		const router = renderRouter( '/items/1', root.addChildren( [ item ] ) );
		expect( await screen.findByText( 'item=1' ) ).toBeVisible();
		await waitFor( () => expect( router.state.status ).toBe( 'idle' ) );

		const unsubscribe = router.subscribe( 'onBeforeLoad', () => {
			unsubscribe();
			removeSearchParams( router, [ 'a' ] );
		} );
		await act( () =>
			router.navigate( { to: '/items/$id', params: { id: '2' }, search: { a: 1, keep: 1 } } )
		);

		expect( await screen.findByText( 'item=2' ) ).toBeVisible();
		await waitFor( () => expect( window.location.search ).toBe( '?keep=1' ) );
		expect( window.location.pathname ).toBe( '/items/2' );
	} );
} );
