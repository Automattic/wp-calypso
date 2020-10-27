/**
 * Internal dependencies
 */
import { isWpMobileApp } from 'calypso/lib/mobile-app';

describe( 'mobile-app', () => {
	test( 'should identify the iOS mobile app', () => {
		global.navigator = {
			userAgent:
				'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16B91 wp-iphone/12.1',
		};

		expect( isWpMobileApp() ).toBeTruthy();
	} );

	test( 'should identify the Android mobile app', () => {
		global.navigator = {
			userAgent:
				'Mozilla/5.0 (Linux; Android 6.0; Android SDK built for x86_64 Build/MASTER; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/44.0.2403.119 Mobile Safari/537.36 wp-android/4.7',
		};

		expect( isWpMobileApp() ).toBeTruthy();
	} );

	test( 'should not identify an unknown user agent', () => {
		global.navigator = {
			userAgent:
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
		};

		expect( isWpMobileApp() ).toBeFalsy();
	} );
} );
