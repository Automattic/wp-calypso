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
import { removeSearchParams, useConsumeSearchParams } from '../use-consume-search-params';

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

function renderPage( url: string, { strict = false } = {} ) {
	window.history.replaceState( null, '', url );
	// Like the dashboard root, always register a blocker: it defers history writes.
	const root = createRootRoute( {
		component: function Root() {
			useBlocker( { shouldBlockFn: shouldBlock } );
			return <Outlet />;
		},
	} );
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
	const router = createRouter( { routeTree: root.addChildren( [ page ] ) } );
	const app = <RouterProvider router={ router } />;
	render( strict ? <StrictMode>{ app }</StrictMode> : app );
	return router;
}

beforeEach( () => {
	onConsume.mockClear();
	shouldBlock.mockClear();
} );

describe( 'useConsumeSearchParams', () => {
	test( 'returns the params on load, then removes them from the URL in one replacement', async () => {
		const router = renderPage( '/page?flash=saved&code=12345678901234567890&state=x&keep=1#tab' );
		const length = window.history.length;

		expect( await screen.findByText( 'code=12345678901234567890 state=x' ) ).toBeVisible();
		await waitFor( () => expect( window.location.search ).toBe( '?keep=1' ) );
		expect( window.location.hash ).toBe( '#tab' );
		expect( window.history.length ).toBe( length );
		expect( router.state.location.search ).toEqual( { keep: 1 } );
		expect( onConsume ).toHaveBeenCalledTimes( 2 );
		expect( onConsume ).toHaveBeenCalledWith( 'saved' );
		expect( onConsume ).toHaveBeenCalledWith( { code: '12345678901234567890', state: 'x' } );
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
} );
