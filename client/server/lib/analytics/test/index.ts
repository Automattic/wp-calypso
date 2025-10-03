import { type Request } from 'express';
import superagent, { type SuperAgentRequest } from 'superagent';
import analytics from '../index';

describe( 'Server-Side Analytics', () => {
	describe( 'tracks.recordEvent', () => {
		beforeAll( () => {
			jest.spyOn( superagent, 'get' ).mockReturnValue( { end: () => {} } as SuperAgentRequest );
			jest.useFakeTimers();
			jest.setSystemTime( 1704067200000 );
		} );

		afterAll( () => {
			jest.useRealTimers();
		} );

		afterEach( () => {
			( superagent.get as jest.Mock ).mockClear();
		} );

		const req = {
			get: ( header: string ) => {
				switch ( header.toLowerCase() ) {
					case 'accept-language':
						return 'cs';
					case 'referer':
						return 'test';
					case 'x-forwarded-for':
						return '1.1.1.1';
					case 'user-agent':
						return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:93.0) Gecko/20100101 Firefox/93.0';
				}
				throw 'no ' + header;
			},
		} as Request;

		test( 'sends an HTTP request to the tracks URL', () => {
			analytics.tracks.recordEvent( 'calypso_test', { a: 'foo' }, req );

			expect( superagent.get ).toHaveBeenCalled();
			const url = new URL( ( superagent.get as jest.Mock ).mock.calls[ 0 ][ 0 ] );
			expect( url.origin ).toBe( 'http://pixel.wp.com' );
			expect( url.pathname ).toBe( '/t.gif' );
			expect( url.searchParams.get( '_en' ) ).toBe( 'calypso_test' );
			expect( url.searchParams.get( '_ts' ) ).toBe( '1704067200000' );
			expect( url.searchParams.get( '_dl' ) ).toBe( 'test' );
			expect( url.searchParams.get( '_lg' ) ).toBe( 'cs' );
			expect( url.searchParams.get( '_via_ip' ) ).toBe( '1.1.1.1' );
			expect( url.searchParams.get( '_via_ua' ) ).toBe(
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:93.0) Gecko/20100101 Firefox/93.0'
			);
			// For anonymous user, as req.cookies is not defined in the test setup for this case
			expect( url.searchParams.get( '_ut' ) ).toBe( 'anon' );
			expect( url.searchParams.get( '_ui' ) ).toEqual( expect.stringMatching( /^[a-f0-9-]+$/i ) );
			expect( url.searchParams.get( '_rt' ) ).toBe( '1704067200000' );
			expect( url.searchParams.get( '_' ) ).toBe( '_' );
			expect( url.searchParams.get( 'a' ) ).toBe( 'foo' );
		} );

		test( 'sends an HTTP request with user details from cookie', () => {
			const reqWithCookie = {
				...req,
				cookies: {
					wordpress_logged_in: encodeURIComponent( 'testuser|12345|token' ),
				},
			} as Request;
			analytics.tracks.recordEvent( 'calypso_user_test', { b: 'bar' }, reqWithCookie );

			expect( superagent.get ).toHaveBeenCalled();
			const url = new URL( ( superagent.get as jest.Mock ).mock.calls[ 0 ][ 0 ] );
			expect( url.origin ).toBe( 'http://pixel.wp.com' );
			expect( url.pathname ).toBe( '/t.gif' );
			expect( url.searchParams.get( '_en' ) ).toBe( 'calypso_user_test' );
			expect( url.searchParams.get( '_ts' ) ).toBe( '1704067200000' );
			expect( url.searchParams.get( '_dl' ) ).toBe( 'test' );
			expect( url.searchParams.get( '_lg' ) ).toBe( 'cs' );
			expect( url.searchParams.get( '_via_ip' ) ).toBe( '1.1.1.1' );
			expect( url.searchParams.get( '_via_ua' ) ).toBe(
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:93.0) Gecko/20100101 Firefox/93.0'
			);
			expect( url.searchParams.get( '_ul' ) ).toBe( 'testuser' );
			expect( url.searchParams.get( '_ui' ) ).toBe( '12345' );
			expect( url.searchParams.get( '_ut' ) ).toBe( 'wpcom:user_id' );
			expect( url.searchParams.get( '_rt' ) ).toBe( '1704067200000' );
			expect( url.searchParams.get( '_' ) ).toBe( '_' );
			expect( url.searchParams.get( 'b' ) ).toBe( 'bar' );
		} );

		test( 'sends an HTTP request with user details from query params', () => {
			const reqWithQuery = {
				...req,
				query: {
					_ui: 'queryuser',
					_ut: 'querytype',
				},
			} as unknown as Request;
			analytics.tracks.recordEvent( 'calypso_query_test', { c: 'baz' }, reqWithQuery );

			expect( superagent.get ).toHaveBeenCalled();
			const url = new URL( ( superagent.get as jest.Mock ).mock.calls[ 0 ][ 0 ] );
			expect( url.origin ).toBe( 'http://pixel.wp.com' );
			expect( url.pathname ).toBe( '/t.gif' );
			expect( url.searchParams.get( '_en' ) ).toBe( 'calypso_query_test' );
			expect( url.searchParams.get( '_ts' ) ).toBe( '1704067200000' );
			expect( url.searchParams.get( '_dl' ) ).toBe( 'test' );
			expect( url.searchParams.get( '_lg' ) ).toBe( 'cs' );
			expect( url.searchParams.get( '_via_ip' ) ).toBe( '1.1.1.1' );
			expect( url.searchParams.get( '_via_ua' ) ).toBe(
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:93.0) Gecko/20100101 Firefox/93.0'
			);
			expect( url.searchParams.get( '_ui' ) ).toBe( 'queryuser' );
			expect( url.searchParams.get( '_ut' ) ).toBe( 'querytype' );
			expect( url.searchParams.get( '_rt' ) ).toBe( '1704067200000' );
			expect( url.searchParams.get( '_' ) ).toBe( '_' );
			expect( url.searchParams.get( 'c' ) ).toBe( 'baz' );
		} );

		test( 'omits an undefined event property', () => {
			analytics.tracks.recordEvent( 'calypso_test', { a: undefined }, req );

			expect( superagent.get ).toHaveBeenCalled();
			const url = new URL( ( superagent.get as jest.Mock ).mock.calls[ 0 ][ 0 ] );
			expect( url.searchParams.get( 'a' ) ).toBeNull();
		} );
	} );
} );
