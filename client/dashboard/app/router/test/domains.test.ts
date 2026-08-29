/**
 * @jest-environment jsdom
 */

import { createRouter } from '@tanstack/react-router';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../context';
import { createDomainsRoutes } from '../domains';
import { rootRoute } from '../root';

function matchedRouteIds( pathname: string ) {
	const router = createRouter( {
		routeTree: rootRoute.addChildren( createDomainsRoutes() ),
		context: { config: APP_CONTEXT_DEFAULT_CONFIG },
	} );

	return router.matchRoutes( { pathname, search: {} } ).map( ( match ) => match.routeId );
}

describe( 'domains routes', () => {
	test.each( [
		'/domains/manage',
		'/domains/manage/example.com',
		'/domains/manage/all/overview/example.com/example.wordpress.com',
	] )( 'legacy path %s does not match the domain overview route', ( pathname ) => {
		const routeIds = matchedRouteIds( pathname );

		expect( routeIds ).not.toContain( '/domains/$domainName' );
		expect( routeIds.at( -1 ) ).toMatch( /\/domains\/manage/ );
	} );

	test( 'a domain name still matches the domain overview route', () => {
		expect( matchedRouteIds( '/domains/example.com' ) ).toContain( '/domains/$domainName' );
	} );
} );
