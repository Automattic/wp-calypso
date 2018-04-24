/**
 * @format
 * @jest-environment jsdom
 */
/**
 * Internal dependencies
 */
import { makeGoogleAnalyticsTrackingFunction } from '../';

jest.mock( 'config', () => {
	const isEnabled = feature => {
		const features = {
			'google-analytics': true,
		};

		return features[ feature ] || false;
	};
	const configApi = key => {
		const config = {
			google_analytics_key: 'foobar',
		};
		return config[ key ];
	};

	configApi.isEnabled = isEnabled;

	return configApi;
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
