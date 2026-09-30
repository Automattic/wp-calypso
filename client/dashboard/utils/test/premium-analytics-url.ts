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
} );
