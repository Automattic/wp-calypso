/**
 * @jest-environment jsdom
 */

import { createRouter } from '@tanstack/react-router';
import { a4aLink } from '../../../utils/link';
import { agencySignupRoute, createAgencyRoutes } from '../agency';
import { rootRoute } from '../root';

function matchSignupUrl( pathname: string ) {
	const router = createRouter( {
		routeTree: rootRoute.addChildren( createAgencyRoutes() ),
		basepath: '/',
	} as never ) as unknown as {
		matchRoutes: ( location: {
			pathname: string;
			search: Record< string, unknown >;
		} ) => Array< { routeId: string } >;
	};

	return router.matchRoutes( { pathname, search: {} } );
}

function runSignupGuard( searchStr: string ) {
	const beforeLoad = agencySignupRoute.options.beforeLoad as unknown as ( options: {
		location: { pathname: string; searchStr: string };
	} ) => void;

	try {
		beforeLoad( { location: { pathname: '/signup', searchStr } } );
	} catch ( error ) {
		return error;
	}
	throw new Error( 'Expected the signup route to redirect' );
}

describe( 'agencySignupRoute', () => {
	it( 'matches the signup address', () => {
		expect( matchSignupUrl( '/signup' ).at( -1 ) ).toMatchObject( { routeId: '/signup' } );
	} );

	it( 'sends the user to the classic signup, keeping the query string', () => {
		expect( runSignupGuard( '?utm_source=test&ref=abc' ) ).toMatchObject( {
			isRedirect: true,
			href: a4aLink( '/signup?utm_source=test&ref=abc' ),
			reloadDocument: true,
		} );
	} );
} );
