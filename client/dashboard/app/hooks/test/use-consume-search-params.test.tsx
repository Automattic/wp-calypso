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
	useRouter,
} from '@tanstack/react-router';
import { act, render, screen, waitFor } from '@testing-library/react';
import { StrictMode, useEffect, useState } from 'react';
import { dashboardRedirect } from '../../router/redirect';
import { useConsumeSearchParams } from '../use-consume-search-params';
import type { AnyRoute } from '@tanstack/react-router';

const onConsume = jest.fn();
let blockerAnswersLater = false;
const shouldBlock = jest.fn( (): boolean | Promise< boolean > =>
	blockerAnswersLater
		? new Promise( ( resolve ) => setTimeout( () => resolve( false ), 30 ) )
		: false
);

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
	// Like the dashboard root, always register a blocker: it defers history writes, by a task
	// or more when it asks in a modal.
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

function DefaultPage() {
	return (
		<>
			<Flash id="saved" />
			<Callback />
		</>
	);
}

function renderPage(
	url: string,
	options?: { strict?: boolean; component?: () => React.ReactElement | null }
) {
	const root = createRootRoute( { component: Root } );
	const page = createRoute( {
		getParentRoute: () => root,
		path: '/page',
		component: options?.component ?? DefaultPage,
	} );
	return renderRouter( url, root.addChildren( [ page ] ), options );
}

const wait = ( ms: number ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) );

beforeEach( () => {
	onConsume.mockClear();
	shouldBlock.mockClear();
} );

describe.each( [
	[ 'answers at once', false ],
	[ 'answers later, like a modal', true ],
] )( 'useConsumeSearchParams, with a blocker that %s', ( _name, answersLater ) => {
	beforeAll( () => {
		blockerAnswersLater = answersLater;
	} );
	afterAll( () => {
		blockerAnswersLater = false;
	} );

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

	test( 'consumes different values that arrive before the removal runs', async () => {
		function Relay() {
			const router = useRouter();
			useConsumeSearchParams( [ 'code' ], {
				onConsume: ( { code } ) => {
					onConsume( code );
					if ( code === 'first' ) {
						router.navigate( { to: '/page', search: { code: 'second' }, ignoreBlocker: true } );
					}
				},
			} );
			return null;
		}
		renderPage( '/page?code=first', { component: Relay } );

		await waitFor( () => expect( onConsume ).toHaveBeenCalledTimes( 2 ) );
		await waitFor( () => expect( window.location.search ).toBe( '' ) );
		expect( onConsume.mock.calls ).toEqual( [ [ 'first' ], [ 'second' ] ] );
	} );

	test( 'removes only the values it consumed, and consumes them again once they return', async () => {
		function Relay() {
			const router = useRouter();
			useConsumeSearchParams( [ 'flash' ], {
				when: ( params ) => params.flash === 'saved',
				onConsume: () => {
					onConsume( 'saved' );
					if ( onConsume.mock.calls.length === 1 ) {
						router.navigate( { to: '/page', search: { flash: 'other' }, ignoreBlocker: true } );
					}
				},
			} );
			return null;
		}
		const router = renderPage( '/page?flash=saved', { component: Relay } );

		await waitFor( () => expect( window.location.search ).toBe( '?flash=other' ) );
		await waitFor( () => expect( router.state.status ).toBe( 'idle' ) );
		await act( () => wait( 20 ) );
		expect( window.location.search ).toBe( '?flash=other' );
		expect( onConsume ).toHaveBeenCalledTimes( 1 );

		await act( () => router.navigate( { to: '/page', search: { flash: 'saved' } } ) );
		await waitFor( () => expect( window.location.search ).toBe( '' ) );
		expect( onConsume ).toHaveBeenCalledTimes( 2 );
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

	test( 'removes the params of two consumers in one commit without adding a history entry', async () => {
		function TwoFlashes() {
			return (
				<>
					<Flash id="saved" />
					<Callback />
				</>
			);
		}
		renderPage( '/page?flash=saved&code=1&keep=1', { component: TwoFlashes } );
		const { length } = window.history;

		await waitFor( () => expect( window.location.search ).toBe( '?keep=1' ) );
		expect( window.history.length ).toBe( length );
		expect( onConsume ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'keeps the history entry and its state', async () => {
		const router = renderPage( '/page' );
		await waitFor( () => expect( router.state.status ).toBe( 'idle' ) );
		await act( () =>
			router.navigate( {
				to: '/page',
				search: { flash: 'saved' },
				state: ( prev ) => Object.assign( {}, prev, { saved: 'valuable' } ),
			} )
		);
		await waitFor( () => expect( window.location.search ).toBe( '' ) );
		const { length } = window.history;
		const index = window.history.state.__TSR_index;

		await act( () => wait( 40 ) );
		expect( window.history.length ).toBe( length );
		expect( window.history.state ).toMatchObject( { saved: 'valuable', __TSR_index: index } );
	} );

	test.each( [ true, false ] )(
		'lets a navigation from `onConsume` start from the clean URL (replace: %s)',
		async ( replace ) => {
			function Relay() {
				const router = useRouter();
				useConsumeSearchParams( [ 'flash' ], {
					onConsume: () => {
						onConsume();
						router.navigate( {
							to: '/page',
							search: ( prev: Record< string, unknown > ) => ( { ...prev, tab: 'x' } ),
							replace,
						} );
					},
				} );
				return null;
			}
			const router = renderPage( '/page?flash=saved', { component: Relay } );

			await waitFor( () => expect( window.location.search ).toBe( '?tab=x' ) );
			await waitFor( () => expect( router.state.status ).toBe( 'idle' ) );
			await act( () => wait( 60 ) );
			expect( window.location.search ).toBe( '?tab=x' );
			expect( onConsume ).toHaveBeenCalledTimes( 1 );
		}
	);

	test( 'leaves a clean entry behind when `onConsume` pushes another', async () => {
		function Relay() {
			const router = useRouter();
			useConsumeSearchParams( [ 'flash' ], {
				onConsume: () => {
					onConsume();
					router.navigate( { to: '/page', search: { tab: 'x' } } );
				},
			} );
			return null;
		}
		const router = renderPage( '/page?flash=saved', { component: Relay } );
		await waitFor( () => expect( window.location.search ).toBe( '?tab=x' ) );
		await waitFor( () => expect( router.state.status ).toBe( 'idle' ) );

		await act( () => router.history.back() );
		await waitFor( () => expect( window.location.search ).toBe( '' ) );
		await waitFor( () => expect( router.state.status ).toBe( 'idle' ) );
		await act( () => wait( 60 ) );
		expect( onConsume ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'leaves the URL clean for a sibling that writes it when it mounts, in the same commit', async () => {
		let show: ( value: boolean ) => void = () => {};
		function UrlSync() {
			const router = useRouter();
			useEffect( () => {
				router.navigate( {
					to: '/page',
					search: ( prev: Record< string, unknown > ) => ( { ...prev, view: 'list' } ),
					replace: true,
				} );
			}, [ router ] );
			return null;
		}
		function Page() {
			const [ isShown, setIsShown ] = useState( false );
			show = setIsShown;
			// Like content behind a suspense boundary, both mount once the router is idle.
			return isShown ? (
				<>
					<UrlSync />
					<Flash id="saved" />
				</>
			) : null;
		}
		const router = renderPage( '/page?flash=saved', { component: Page } );
		await waitFor( () => expect( router.state.status ).toBe( 'idle' ) );

		act( () => show( true ) );
		await waitFor( () => expect( window.location.search ).toBe( '?view=list' ) );
		await waitFor( () => expect( router.state.status ).toBe( 'idle' ) );
		await act( () => wait( 60 ) );
		expect( window.location.search ).toBe( '?view=list' );
		expect( onConsume ).toHaveBeenCalledTimes( 1 );
	} );
} );
