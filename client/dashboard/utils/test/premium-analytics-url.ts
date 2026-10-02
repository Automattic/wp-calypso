import { getPremiumAnalyticsPath } from '../premium-analytics-url';

describe( 'getPremiumAnalyticsPath', () => {
	it( 'carries the dashboard route in the p param, encoded', () => {
		expect( getPremiumAnalyticsPath( '/post/123' ) ).toBe(
			'admin.php?page=jetpack-premium-analytics-wp-admin&p=%2Fpost%2F123'
		);
	} );
} );
