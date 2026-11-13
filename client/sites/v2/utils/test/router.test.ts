/**
 * @jest-environment jsdom
 */
import pagejs from '@automattic/calypso-router';
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	redirect,
} from '@tanstack/react-router';
import { waitFor } from '@testing-library/react';
import { createBrowserHistoryAndMemoryRouterSync } from '../router';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { show: jest.fn(), replace: jest.fn() },
} ) );

const rootRoute = createRootRoute();
const routeTree = rootRoute.addChildren( [
	createRoute( { getParentRoute: () => rootRoute, path: '/purchases' } ),
	createRoute( {
		getParentRoute: () => rootRoute,
		path: '/old-purchases',
		beforeLoad: () => {
			throw redirect( { to: '/purchases' } );
		},
	} ),
] );

let unsubscribe: () => void;

async function setUp() {
	window.history.replaceState( null, '', '/purchases?removed=plan' );
	const router = createRouter( {
		routeTree,
		history: createMemoryHistory( { initialEntries: [ '/purchases?removed=plan' ] } ),
	} );
	await router.load();
	const { syncMemoryRouterToBrowserHistory } = createBrowserHistoryAndMemoryRouterSync();
	unsubscribe = syncMemoryRouterToBrowserHistory( router );
	return router;
}

describe( 'syncMemoryRouterToBrowserHistory', () => {
	afterEach( () => {
		unsubscribe();
		jest.clearAllMocks();
	} );

	test( 'replaces the browser entry when the router navigates with replace', async () => {
		const router = await setUp();

		void router.navigate( { to: '/purchases', search: {}, replace: true } );

		await waitFor( () => expect( pagejs.replace ).toHaveBeenCalledWith( '/purchases' ) );
		expect( pagejs.show ).not.toHaveBeenCalled();
	} );

	test( 'replaces the browser entry when a route redirects', async () => {
		const router = await setUp();

		void router.navigate( { to: '/old-purchases' } );
		await waitFor( () => expect( pagejs.show ).toHaveBeenCalledWith( '/old-purchases' ) );
		// Without a RouterProvider, nothing loads the new location, so load it here to run the redirect.
		void router.load();

		await waitFor( () => expect( pagejs.replace ).toHaveBeenLastCalledWith( '/purchases' ) );
	} );

	test( 'adds a browser entry when the router pushes', async () => {
		const router = await setUp();

		void router.navigate( { to: '/purchases', search: {} } );

		await waitFor( () => expect( pagejs.show ).toHaveBeenCalledWith( '/purchases' ) );
		expect( pagejs.replace ).not.toHaveBeenCalled();
	} );

	test( 'leaves page.js alone when the browser is already at the URL', async () => {
		const router = await setUp();

		router.history.replace( '/purchases?removed=plan' );

		expect( pagejs.show ).not.toHaveBeenCalled();
		expect( pagejs.replace ).not.toHaveBeenCalled();
	} );
} );
