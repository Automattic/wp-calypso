import { getPremiumAnalyticsPath } from '../premium-analytics-url';

/**
 * The route the dashboard would read out of the `p` param.
 * @param path The wp-admin path.
 */
function route( path: string ) {
	return new URLSearchParams( path.split( '?' ).slice( 1 ).join( '?' ) ).get( 'p' );
}

describe( 'getPremiumAnalyticsPath', () => {
	it( 'carries the dashboard route in the p param, encoded', () => {
		expect( getPremiumAnalyticsPath( '/post/123' ) ).toBe(
			'admin.php?page=jetpack-premium-analytics-wp-admin&p=%2Fpost%2F123'
		);
	} );

	it( 'opens the route on whole days in the site offset', () => {
		expect(
			route(
				getPremiumAnalyticsPath( '/reports/posts', {
					from: '2026-09-24',
					to: '2026-09-30',
					gmtOffset: 5.5,
				} )
			)
		).toBe(
			'/reports/posts?from=2026-09-24T00%3A00%3A00.000%2B05%3A30&to=2026-09-30T23%3A59%3A59.999%2B05%3A30'
		);
	} );

	it( 'writes a negative offset with its sign', () => {
		expect(
			route(
				getPremiumAnalyticsPath( '/', { from: '2026-09-30', to: '2026-09-30', gmtOffset: -8 } )
			)
		).toBe( '/?from=2026-09-30T00%3A00%3A00.000-08%3A00&to=2026-09-30T23%3A59%3A59.999-08%3A00' );
	} );

	it( 'leaves off a range that is not whole days, so the route keeps its default', () => {
		expect(
			route( getPremiumAnalyticsPath( '/', { from: '2026-09', to: '2026-09-30', gmtOffset: 0 } ) )
		).toBe( '/' );
	} );

	// gmtOffset is the offset of today, after the change, so it is wrong for the earlier end.
	it( 'gives each end the offset of its own day across a spring-forward change', () => {
		expect(
			route(
				getPremiumAnalyticsPath( '/', {
					from: '2026-03-03',
					to: '2026-03-09',
					gmtOffset: -4,
					timezone: 'America/New_York',
				} )
			)
		).toBe( '/?from=2026-03-03T00%3A00%3A00.000-05%3A00&to=2026-03-09T23%3A59%3A59.999-04%3A00' );
	} );

	it( 'gives each end the offset of its own time on a fall-back day', () => {
		expect(
			route(
				getPremiumAnalyticsPath( '/', {
					from: '2026-11-01',
					to: '2026-11-01',
					gmtOffset: -5,
					timezone: 'America/New_York',
				} )
			)
		).toBe( '/?from=2026-11-01T00%3A00%3A00.000-04%3A00&to=2026-11-01T23%3A59%3A59.999-05%3A00' );
	} );

	// The same clock digits read as UTC land on 5 April, after Sydney's switch to +10:00.
	it( 'reads the offset at the site clock time, not at the same digits in UTC', () => {
		expect(
			route(
				getPremiumAnalyticsPath( '/', {
					from: '2026-04-04',
					to: '2026-04-04',
					gmtOffset: 10,
					timezone: 'Australia/Sydney',
				} )
			)
		).toBe(
			'/?from=2026-04-04T00%3A00%3A00.000%2B11%3A00&to=2026-04-04T23%3A59%3A59.999%2B11%3A00'
		);
	} );

	it( 'starts a day whose midnight is skipped at its first real time, not in the day before', () => {
		expect(
			route(
				getPremiumAnalyticsPath( '/', {
					from: '2026-03-08',
					to: '2026-03-08',
					gmtOffset: -4,
					timezone: 'America/Havana',
				} )
			)
		).toBe( '/?from=2026-03-08T01%3A00%3A00.000-04%3A00&to=2026-03-08T23%3A59%3A59.999-04%3A00' );
	} );

	// Havana repeats the first hour of 1 November, and Santiago the last hour of 4 April.
	it( 'covers both runs of an hour the clock repeats at either end of a day', () => {
		const days = ( day: string, timezone: string ) =>
			route( getPremiumAnalyticsPath( '/', { from: day, to: day, gmtOffset: 0, timezone } ) );

		expect( days( '2026-11-01', 'America/Havana' ) ).toBe(
			'/?from=2026-11-01T00%3A00%3A00.000-04%3A00&to=2026-11-01T23%3A59%3A59.999-05%3A00'
		);
		expect( days( '2026-04-04', 'America/Santiago' ) ).toBe(
			'/?from=2026-04-04T00%3A00%3A00.000-03%3A00&to=2026-04-04T23%3A59%3A59.999-04%3A00'
		);
	} );

	it( 'falls back to the fixed offset for a timezone the browser does not know', () => {
		expect(
			route(
				getPremiumAnalyticsPath( '/', {
					from: '2026-09-30',
					to: '2026-09-30',
					gmtOffset: 2,
					timezone: 'Not/A_Zone',
				} )
			)
		).toBe(
			'/?from=2026-09-30T00%3A00%3A00.000%2B02%3A00&to=2026-09-30T23%3A59%3A59.999%2B02%3A00'
		);
	} );
} );
