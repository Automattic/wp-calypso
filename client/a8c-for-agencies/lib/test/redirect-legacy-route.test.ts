/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import redirectLegacyRoute from '../redirect-legacy-route';
import type { Context } from '@automattic/calypso-router';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { redirect: jest.fn() },
} ) );

const contextWith = ( querystring: string ) => ( { querystring } ) as Context;

describe( 'redirectLegacyRoute', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'redirects to the destination when there is no query string', () => {
		redirectLegacyRoute( '/sites/reports/build' )( contextWith( '' ), jest.fn() );

		expect( page.redirect ).toHaveBeenCalledWith( '/sites/reports/build' );
	} );

	it( 'keeps the query string so bookmarked links land on the same content', () => {
		redirectLegacyRoute( '/sites/reports/build' )(
			contextWith( 'sourceId=42&reportId=7' ),
			jest.fn()
		);

		expect( page.redirect ).toHaveBeenCalledWith( '/sites/reports/build?sourceId=42&reportId=7' );
	} );
} );
