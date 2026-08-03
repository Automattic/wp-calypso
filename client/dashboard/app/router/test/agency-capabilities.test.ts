/**
 * @jest-environment jsdom
 */

import { createAgencyRoutes, hasAnyCapability, isAllowedByCapabilities } from '../agency';
import type { StaticDataRouteOption } from '@tanstack/react-router';

type RouteNode = {
	options?: { path?: string; staticData?: StaticDataRouteOption };
	children?: RouteNode[];
};

// Routes that are intentionally reachable by any agency member, so they carry
// no `requiresAgencyCapability`. Anything else must be guarded by itself or an
// ancestor; a new unguarded route will fail the coverage test below.
const OPEN_ROUTE_PATHS = new Set( [
	'', // the pathless `agency` guard route itself
	'overview', // the fallback the capability guard redirects to
] );

function collectUnguardedRoutes(
	route: RouteNode,
	ancestorGuarded: boolean,
	parentPath: string
): string[] {
	// Index routes carry `path: '/'`; treat it as no segment so paths don't
	// gain a trailing `//`.
	const path = route.options?.path === '/' ? undefined : route.options?.path;
	const fullPath = path ? [ parentPath, path ].filter( Boolean ).join( '/' ) : parentPath;
	const guarded = ancestorGuarded || !! route.options?.staticData?.requiresAgencyCapability;
	const children = Array.isArray( route.children ) ? route.children : [];

	const unguarded = ! guarded && ! OPEN_ROUTE_PATHS.has( fullPath ) ? [ fullPath ] : [];

	return children.reduce< string[] >(
		( acc, child ) => acc.concat( collectUnguardedRoutes( child, guarded, fullPath ) ),
		unguarded
	);
}

describe( 'hasAnyCapability', () => {
	test( 'returns true when the single required capability is present', () => {
		expect( hasAnyCapability( [ 'a4a_read_reports' ], 'a4a_read_reports' ) ).toBe( true );
	} );

	test( 'returns false when the single required capability is absent', () => {
		expect( hasAnyCapability( [ 'a4a_read_users' ], 'a4a_read_reports' ) ).toBe( false );
	} );

	test( 'returns true when at least one of an array is present (any-of)', () => {
		expect(
			hasAnyCapability( [ 'a4a_read_users' ], [ 'a4a_read_reports', 'a4a_read_users' ] )
		).toBe( true );
	} );

	test( 'returns false when none of an array is present', () => {
		expect(
			hasAnyCapability( [ 'a4a_read_marketplace' ], [ 'a4a_read_reports', 'a4a_read_users' ] )
		).toBe( false );
	} );

	test( 'returns false for an empty capabilities list', () => {
		expect( hasAnyCapability( [], 'a4a_read_reports' ) ).toBe( false );
	} );
} );

describe( 'isAllowedByCapabilities', () => {
	test( 'allows a route with no capability requirement', () => {
		expect( isAllowedByCapabilities( [ { staticData: {} }, {} ], [] ) ).toBe( true );
	} );

	test( 'allows when the required capability is present', () => {
		expect(
			isAllowedByCapabilities(
				[ { staticData: { requiresAgencyCapability: 'a4a_read_reports' } } ],
				[ 'a4a_read_reports' ]
			)
		).toBe( true );
	} );

	test( 'blocks when a matched route requires an absent capability', () => {
		expect(
			isAllowedByCapabilities(
				[ { staticData: { requiresAgencyCapability: 'a4a_read_reports' } } ],
				[ 'a4a_read_users' ]
			)
		).toBe( false );
	} );

	test( 'blocks when any matched route in the chain is unauthorized', () => {
		expect(
			isAllowedByCapabilities(
				[
					{ staticData: {} },
					{
						staticData: {
							requiresAgencyCapability: [ 'a4a_read_reports', 'a4a_edit_reports' ],
						},
					},
				],
				[ 'a4a_read_users' ]
			)
		).toBe( false );
	} );
} );

describe( 'createAgencyRoutes capability coverage', () => {
	test( 'every agency route is capability-guarded or explicitly open', () => {
		const routes = createAgencyRoutes() as RouteNode[];
		const unguarded = routes.reduce< string[] >(
			( acc, route ) => acc.concat( collectUnguardedRoutes( route, false, '' ) ),
			[]
		);

		expect( unguarded ).toEqual( [] );
	} );
} );
