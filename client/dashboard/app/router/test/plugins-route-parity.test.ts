/**
 * @jest-environment jsdom
 */

import { createAgencyRoutes } from '../agency';
import { createPluginsRoutes } from '../plugins';

type RouteNode = {
	options?: { path?: string };
	children?: RouteNode[];
};

function normalizeSegment( path?: string ) {
	return ( path ?? '' ).replace( /^\/+|\/+$/g, '' );
}

function collectPaths( route: RouteNode, parentPath: string ): string[] {
	const segment = normalizeSegment( route.options?.path );
	const fullPath = [ parentPath, segment ].filter( Boolean ).join( '/' );
	const children = Array.isArray( route.children ) ? route.children : [];

	return children.reduce< string[] >(
		( acc, child ) => acc.concat( collectPaths( child, fullPath ) ),
		[ fullPath ]
	);
}

function findPluginsSubtree( routes: RouteNode[] ): RouteNode | undefined {
	for ( const route of routes ) {
		if ( normalizeSegment( route.options?.path ) === 'plugins' ) {
			return route;
		}
		const match = findPluginsSubtree( route.children ?? [] );
		if ( match ) {
			return match;
		}
	}
	return undefined;
}

// The agency router deliberately owns its copy of the plugins route tree
// (with its own capability gating) instead of reusing the dotcom one, and
// shared screens navigate between the two trees via untyped path constants
// from `client/dashboard/plugins/paths.ts`. Nothing type-checks that the
// trees stay in sync, so a path added or renamed in one tree only would
// surface as a runtime 404 in the other app. This test is that check.
describe( 'plugins route parity', () => {
	test( 'the agency plugins route tree exposes the same paths as the dotcom one', () => {
		const dotcomSubtree = findPluginsSubtree( createPluginsRoutes() as RouteNode[] );
		const agencySubtree = findPluginsSubtree( createAgencyRoutes() as RouteNode[] );

		expect( dotcomSubtree ).toBeDefined();
		expect( agencySubtree ).toBeDefined();

		const dotcomPaths = [ ...new Set( collectPaths( dotcomSubtree as RouteNode, '' ) ) ].sort();
		const agencyPaths = [ ...new Set( collectPaths( agencySubtree as RouteNode, '' ) ) ].sort();

		expect( dotcomPaths ).toContain( 'plugins/manage' );
		expect( agencyPaths ).toEqual( dotcomPaths );
	} );
} );
