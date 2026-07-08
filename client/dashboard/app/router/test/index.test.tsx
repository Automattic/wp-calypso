/**
 * @jest-environment jsdom
 */

import { APP_CONTEXT_DEFAULT_CONFIG, type AppConfig } from '../../context';
import { getRouter } from '../index';

function collectPaths( route: unknown, paths: string[] = [] ): string[] {
	if ( ! route || typeof route !== 'object' ) {
		return paths;
	}

	const options = ( route as { options?: { path?: unknown } } ).options;
	const path = options?.path ?? ( route as { path?: unknown } ).path;
	if ( typeof path === 'string' ) {
		paths.push( path );
	}

	const children = ( route as { children?: unknown } ).children;
	if ( Array.isArray( children ) ) {
		children.forEach( ( child ) => collectPaths( child, paths ) );
	}

	return paths;
}

test( 'registers a catch-all route so unmatched paths still resolve to a route', () => {
	const router = getRouter( APP_CONTEXT_DEFAULT_CONFIG as AppConfig );

	expect( collectPaths( router.routeTree ) ).toContain( '$' );
} );
