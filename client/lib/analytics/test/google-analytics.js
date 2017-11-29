/**
 * @format
 * @jest-environment jsdom
 */
/**
 * Internal dependencies
 */
import { makeGoogleAnalyticsTrackingFunction } from '../';

jest.mock( 'config', () => key => {
	const config = {
		google_analytics_enabled: true,
		google_analytics_key: 'foobar',
	};
	return config[ key ];
} );
jest.mock( 'lib/analytics/ad-tracking', () => ( {
	retarget: () => {},
} ) );
jest.mock( 'lib/load-script', () => require( './mocks/lib/load-script' ) );

describe( 'analytics.ga', () => {
	describe( 'makeGoogleAnalyticsTrackingFunction', () => {
		test( 'calls the wrapped function with passed arguments when enabled', () => {
			const wrapped = jest.fn();
			makeGoogleAnalyticsTrackingFunction( wrapped )( 'a', 'b', 'c' );

			expect( wrapped ).toHaveBeenCalledWith( 'a', 'b', 'c' );
		} );
	} );
} );
