import { getSidebarState } from '../sidebar-state';
import type { AnyRouteMatch } from '@tanstack/react-router';

// Use the actual route IDs derived from TanStack Router's path convention.
const makeMatch = ( routeId: string, params: Record< string, string > = {} ) =>
	( { routeId, params, status: 'success' } ) as unknown as AnyRouteMatch;

describe( 'getSidebarState', () => {
	test( 'returns root when no route-specific matches', () => {
		expect( getSidebarState( [ makeMatch( '/' ) ], false ) ).toEqual( { screen: 'root' } );
	} );

	test( 'returns site screen with siteSlug param', () => {
		expect(
			getSidebarState(
				[
					makeMatch( '/' ),
					makeMatch( '/sites/$siteSlug', { siteSlug: 'example.wordpress.com' } ),
				],
				false
			)
		).toEqual( { screen: 'site', param: 'example.wordpress.com' } );
	} );

	test( 'returns domain screen with domainName param', () => {
		expect(
			getSidebarState(
				[ makeMatch( '/' ), makeMatch( '/domains/$domainName', { domainName: 'example.com' } ) ],
				false
			)
		).toEqual( { screen: 'domain', param: 'example.com' } );
	} );

	test( 'returns me screen', () => {
		expect( getSidebarState( [ makeMatch( '/' ), makeMatch( '/me' ) ], false ) ).toEqual( {
			screen: 'me',
		} );
	} );

	test( 'returns root when hasError is true', () => {
		expect(
			getSidebarState(
				[
					makeMatch( '/' ),
					makeMatch( '/sites/$siteSlug', { siteSlug: 'example.wordpress.com' } ),
				],
				true
			)
		).toEqual( { screen: 'root' } );
	} );
} );
