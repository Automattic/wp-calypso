/**
 * @jest-environment jsdom
 */

import { makeGoogleAnalyticsTrackingFunction } from '../ga';

jest.mock( '@automattic/calypso-config', () => {
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

jest.mock( 'calypso/lib/analytics/utils', () => ( {
	isGoogleAnalyticsAllowed: () => true,
	isPiiUrl: () => false,
	mayWeTrackCurrentUserGdpr: () => true,
	refreshCountryCodeCookieGdpr: () => null,
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
			return makeGoogleAnalyticsTrackingFunction( wrapped )( 'a', 'b', 'c' ).then( () => {
				expect( wrapped ).toHaveBeenCalledWith( 'a', 'b', 'c' );
			} );
		} );
	} );
} );
