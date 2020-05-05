/**
 * @jest-environment jsdom
 */
/**
 * Internal dependencies
 */
import { makeGoogleAnalyticsTrackingFunction } from '../ga';

jest.mock( 'config', () => {
	const isEnabled = ( feature ) => {
		const features = {
			'ad-tracking': true,
		};

		return features[ feature ] || false;
	};
	const configApi = ( key ) => {
		const config = {
			google_analytics_key: 'foobar',
		};
		return config[ key ];
	};

	configApi.isEnabled = isEnabled;

	return configApi;
} );

jest.mock( 'lib/analytics/utils', () => ( {
	isGoogleAnalyticsAllowed: () => true,
	isPiiUrl: () => false,
	mayWeTrackCurrentUserGdpr: () => true,
} ) );

jest.mock( '@automattic/calypso-analytics', () => ( {
	getDoNotTrack: () => false,
	getCurrentUser: () => undefined,
} ) );

jest.mock( '@automattic/load-script', () => require( './mocks/lib/load-script' ) );

describe( 'analytics/ga', () => {
	describe( 'makeGoogleAnalyticsTrackingFunction', () => {
		test( 'calls the wrapped function with passed arguments when enabled', () => {
			const wrapped = jest.fn();
			makeGoogleAnalyticsTrackingFunction( wrapped )( 'a', 'b', 'c' );

			expect( wrapped ).toHaveBeenCalledWith( 'a', 'b', 'c' );
		} );
	} );
} );
