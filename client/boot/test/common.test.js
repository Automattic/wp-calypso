/**
 * @jest-environment jsdom
 */

import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { getToken } from '@automattic/oauth-token';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { oauthTokenMiddleware } from '../common';

jest.mock( '@automattic/calypso-config', () =>
	Object.assign( jest.fn(), { isEnabled: jest.fn( () => true ) } )
);
jest.mock( '@automattic/calypso-router', () => jest.fn() );
jest.mock( '@automattic/oauth-token', () => ( { getToken: jest.fn( () => false ) } ) );
jest.mock( 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies', () => jest.fn( () => true ) );
jest.mock( 'calypso/lib/jetpack/is-jetpack-cloud', () => () => false );
jest.mock( 'calypso/dashboard/app-a4a/routing', () => ( {
	isAllowedA4ADashboardHostname: () => false,
} ) );
jest.mock( '@automattic/api-queries', () => ( {} ) );
jest.mock( 'calypso/components/email-verification', () => ( {} ) );
jest.mock( 'calypso/lib/analytics/init', () => ( {} ) );
jest.mock( 'calypso/lib/analytics/super-props', () => ( {} ) );
jest.mock( 'calypso/lib/desktop-listeners', () => ( {} ) );
jest.mock( 'calypso/lib/detect-history-navigation', () => ( {} ) );
jest.mock( 'calypso/lib/load-dev-helpers', () => ( {} ) );
jest.mock( 'calypso/lib/logmein', () => ( {} ) );
jest.mock( 'calypso/lib/protect-form', () => ( {} ) );
jest.mock( 'calypso/lib/redux-bridge', () => ( {} ) );
jest.mock( 'calypso/lib/route', () => ( {} ) );
jest.mock( 'calypso/lib/route/legacy-routes', () => ( {} ) );
jest.mock( 'calypso/lib/url', () => ( {} ) );
jest.mock( 'calypso/lib/user/shared-utils', () => ( {} ) );
jest.mock( 'calypso/lib/user/store', () => ( {} ) );
jest.mock( 'calypso/lib/user/support-user-interop', () => ( {} ) );
jest.mock( 'calypso/sections-middleware', () => ( {} ) );
jest.mock( 'calypso/state', () => ( {} ) );
jest.mock( 'calypso/state/current-user/actions', () => ( {} ) );
jest.mock( 'calypso/state/initial-state', () => ( {} ) );
jest.mock( 'calypso/state/push-notifications/actions', () => ( {} ) );
jest.mock( 'calypso/state/query-client', () => ( {} ) );
jest.mock( 'calypso/state/reducer', () => ( {} ) );
jest.mock( 'calypso/state/redux-store', () => ( {} ) );
jest.mock( 'calypso/state/route/actions', () => ( {} ) );
jest.mock( 'calypso/lib/error-logger/setup-error-logger', () => ( {} ) );
jest.mock( '../locale', () => ( {} ) );

describe( 'public error page OAuth exemption', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		config.isEnabled.mockReturnValue( true );
		isA8CForAgencies.mockReturnValue( true );
		getToken.mockReturnValue( false );
		Object.defineProperty( window.crypto, 'randomUUID', {
			configurable: true,
			value: () => 'test-oauth-state',
		} );
	} );

	it( 'lets an anonymous visitor reach the exact public path with query parameters', () => {
		oauthTokenMiddleware();
		const [ , middleware ] = page.mock.calls[ 0 ];
		const next = jest.fn();

		middleware(
			{
				pathname: '/error',
				path: '/error?code=a4a_pressable_titan_redirect_expired&return_to=pressable',
			},
			next
		);

		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	it.each( [
		[ true, '/error/extra' ],
		[ true, '/error-other' ],
		[ false, '/error' ],
		[ true, '/pressable/checkout-error' ],
	] )( 'keeps the OAuth guard for A4A=%s at %s', ( isA4A, pathname ) => {
		isA8CForAgencies.mockReturnValue( isA4A );
		oauthTokenMiddleware();
		const [ , middleware ] = page.mock.calls[ 0 ];
		const next = jest.fn();
		const guardReached = new Error( 'OAuth authorization required' );
		config.mockImplementationOnce( () => {
			throw guardReached;
		} );

		expect( () => middleware( { pathname, path: pathname }, next ) ).toThrow( guardReached );
		expect( next ).not.toHaveBeenCalled();
	} );
} );
