import UserAgent from 'express-useragent';
import superagent from 'superagent';
import analytics from '../index';
jest.mock( '@automattic/calypso-config', () => jest.fn() );
jest.mock( 'calypso/lib/analytics/statsd-utils', () => ( {
	createStatsdURL: jest.fn(),
} ) );

describe( 'Server-Side Analytics', () => {
	describe( 'tracks.recordEvent', () => {
		beforeAll( function () {
			jest.spyOn( superagent, 'get' ).mockReturnValue( { end: () => {} } );
		} );

		afterEach( () => {
			superagent.get.mockClear();
		} );

		const req = {
			get: ( header ) => {
				switch ( header.toLowerCase() ) {
					case 'accept-language':
						return 'cs';
					case 'referer':
						return 'test';
					case 'x-forwarded-for':
						return '1.1.1.1';
				}
				throw 'no ' + header;
			},
			useragent: UserAgent.parse(
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:93.0) Gecko/20100101 Firefox/93.0'
			),
		};

		test( 'sends an HTTP request to the tracks URL', () => {
			analytics.tracks.recordEvent( 'calypso_test', { a: 'foo' }, req );

			expect( superagent.get ).toHaveBeenCalled();
			const url = new URL( superagent.get.mock.calls[ 0 ][ 0 ] );
			expect( url.origin ).toBe( 'http://pixel.wp.com' );
			expect( url.pathname ).toBe( '/t.gif' );
			expect( url.searchParams.get( '_lg' ) ).toBe( 'cs' );
			expect( url.searchParams.get( 'a' ) ).toBe( 'foo' );
		} );

		test( 'omits an undefined event property', () => {
			analytics.tracks.recordEvent( 'calypso_test', { a: undefined }, req );

			expect( superagent.get ).toHaveBeenCalled();
			const url = new URL( superagent.get.mock.calls[ 0 ][ 0 ] );
			expect( url.searchParams.get( 'a' ) ).toBeNull();
		} );
	} );
} );
