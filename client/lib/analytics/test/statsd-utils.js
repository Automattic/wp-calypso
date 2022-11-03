import config from '@automattic/calypso-config';
import superagent from 'superagent';
import { createStatsdURL, logServerEvent } from '../statsd-utils';

jest.mock( '@automattic/calypso-config' );

describe( 'StatsD Analytics Utils', () => {
	describe( 'createStatsdURL', () => {
		beforeAll( () => {
			config.mockReturnValue( 'development' ); // boom_analytics_key
		} );

		test( 'returns a URL for sending events to statsd', () => {
			const events = [
				{
					name: 'response_time',
					value: 100,
					type: 'timing',
				},
				{
					name: 'page-load',
					type: 'counting',
				},
			];
			const sdUrl = new URL( createStatsdURL( 'my-section-name', events ) );

			expect( sdUrl.searchParams.get( 'v' ) ).toEqual( 'calypso' );
			expect( sdUrl.searchParams.get( 'u' ) ).toEqual( 'my_section_name' );
			expect( sdUrl.searchParams.get( 'json' ) ).toEqual(
				JSON.stringify( {
					beacons: [
						'calypso.development.server.my_section_name.response_time:100|ms',
						'calypso.development.server.my_section_name.page_load:1|c',
					],
				} )
			);
		} );

		test( 'does not include server hierarchy in legacy events', () => {
			const sdUrl = new URL(
				createStatsdURL( 'my-section-name', {
					name: 'test',
					type: 'counting',
					isLegacy: true,
				} )
			);
			expect( sdUrl.searchParams.get( 'json' ) ).toEqual(
				JSON.stringify( {
					beacons: [ 'calypso.development.my_section_name.test:1|c' ],
				} )
			);
		} );

		test( 'processes a single event without an array container', () => {
			const event = {
				name: 'response_time',
				value: 100,
				type: 'timing',
			};
			const sdUrl = new URL( createStatsdURL( 'my-section-name', event ) );

			expect( sdUrl.searchParams.get( 'v' ) ).toEqual( 'calypso' );
			expect( sdUrl.searchParams.get( 'u' ) ).toEqual( 'my_section_name' );
			expect( sdUrl.searchParams.get( 'json' ) ).toEqual(
				JSON.stringify( {
					beacons: [ 'calypso.development.server.my_section_name.response_time:100|ms' ],
				} )
			);
		} );
	} );

	describe( 'logServerEvent', () => {
		beforeAll( () => {
			jest.spyOn( superagent, 'get' ).mockReturnValue( { end: () => {} } );
		} );

		afterAll( () => {
			config.mockRestore();
		} );

		afterEach( () => {
			superagent.get.mockClear();
		} );

		test( 'sends an HTTP request to the statsd URL', () => {
			config.mockReturnValue( true ); // server_side_boom_analytics_enabled
			logServerEvent( 'test-section', { name: 'foo', type: 'counting' } );

			expect( superagent.get ).toHaveBeenCalledWith( expect.stringContaining( 'u=test_section' ) );
		} );

		test( 'does not record event if statsd analytics is not allowed', () => {
			config.mockReturnValue( false ); // server_side_boom_analytics_enabled
			logServerEvent( { name: 'foo', type: 'counting' } );

			expect( superagent.get ).not.toHaveBeenCalled();
		} );

		test( 'sets calypso section to unknown if undefined', () => {
			config.mockReturnValue( true ); // server_side_boom_analytics_enabled
			logServerEvent( undefined, { name: 'foo', type: 'counting' } );
			expect( superagent.get ).toHaveBeenCalledWith( expect.stringContaining( 'u=unknown' ) );
		} );
	} );
} );
