import config from '@automattic/calypso-config';
import UserAgent from 'express-useragent';
import superagent from 'superagent';
import { createStatsdURL } from 'calypso/lib/analytics/statsd-utils';
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

	describe( 'statsd.recordEvents', () => {
		beforeEach( () => {
			jest.spyOn( superagent, 'get' ).mockReturnValue( { end: () => {} } );
		} );

		afterEach( () => {
			createStatsdURL.mockClear();
			superagent.get.mockClear();
		} );

		test( 'sends an HTTP request to the statsd URL', () => {
			config.mockReturnValue( true ); // server_side_boom_analytics_enabled
			createStatsdURL.mockReturnValue( 'http://example.com/boom.gif' );

			const testArr = [ 'foo' ];
			analytics.statsd.recordEvents( 'reader', testArr );

			expect( createStatsdURL ).toHaveBeenCalledWith( 'reader', testArr );
			expect( superagent.get ).toHaveBeenCalledWith( 'http://example.com/boom.gif' );
		} );

		test( 'does nothing if statsd analytics is not allowed', () => {
			config.mockReturnValue( false ); // server_side_boom_analytics_enabled

			const testArr = [ 'foo' ];
			analytics.statsd.recordEvents( 'reader', testArr );

			expect( createStatsdURL ).not.toHaveBeenCalled();
			expect( superagent.get ).not.toHaveBeenCalled();
		} );
	} );
} );
