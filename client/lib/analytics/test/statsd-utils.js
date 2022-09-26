import { createStatsdURL } from '../statsd-utils';

describe( 'StatsD Analytics Utils', () => {
	describe( 'createStatsdURL', () => {
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
						'calypso.development.my_section_name.response_time:100|ms',
						'calypso.development.my_section_name.page_load:1|c',
					],
				} )
			);
		} );
	} );
} );
