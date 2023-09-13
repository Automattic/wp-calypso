import { isWpMobileApp, isWcMobileApp, getMobileDeviceInfo } from 'calypso/lib/mobile-app';

describe( 'isWpMobileApp', () => {
	test( 'should identify the WordPress for iOS mobile app', () => {
		global.navigator = {
			userAgent:
				'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16B91 wp-iphone/12.1',
		};

		expect( isWpMobileApp() ).toBeTruthy();
	} );

	test( 'should identify the WordPress for Android mobile app', () => {
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

describe( 'isWcMobileApp', () => {
	test( 'should identify the WooCommerce for iOS mobile app', () => {
		global.navigator = {
			userAgent:
				'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16B91 wc-ios/12.1',
		};

		expect( isWcMobileApp() ).toBeTruthy();
	} );

	test( 'should identify the WooCommerce for Android mobile app', () => {
		global.navigator = {
			userAgent:
				'Mozilla/5.0 (Linux; Android 6.0; Android SDK built for x86_64 Build/MASTER; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/44.0.2403.119 Mobile Safari/537.36 wc-android/4.7',
		};

		expect( isWcMobileApp() ).toBeTruthy();
	} );

	test( 'should not identify an unknown user agent', () => {
		global.navigator = {
			userAgent:
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
		};

		expect( isWcMobileApp() ).toBeFalsy();
	} );
} );

describe( 'getMobileDeviceInfo', () => {
	test( 'should return the correct device/version for WordPress iOS mobile app', () => {
		global.navigator = {
			userAgent:
				'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16B91 wp-iphone/12.1',
		};

		expect( getMobileDeviceInfo() ).toStrictEqual( { device: 'iphone', version: '12.1' } );
	} );

	test( 'should return the correct device/version for WordPress Android mobile app', () => {
		global.navigator = {
			userAgent:
				'Mozilla/5.0 (Linux; Android 6.0; Android SDK built for x86_64 Build/MASTER; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/44.0.2403.119 Mobile Safari/537.36 wp-android/4.7',
		};

		expect( getMobileDeviceInfo() ).toStrictEqual( { device: 'android', version: '4.7' } );
	} );

	test( 'should return the correct device/version for WooCommerce for iOS mobile app', () => {
		global.navigator = {
			userAgent:
				'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16B91 wc-ios/12.1',
		};

		expect( getMobileDeviceInfo() ).toStrictEqual( { device: 'ios', version: '12.1' } );
	} );

	test( 'should return the correct device/version for WooCommerce Android mobile app', () => {
		global.navigator = {
			userAgent:
				'Mozilla/5.0 (Linux; Android 6.0; Android SDK built for x86_64 Build/MASTER; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/44.0.2403.119 Mobile Safari/537.36 wc-android/4.7',
		};

		expect( getMobileDeviceInfo() ).toStrictEqual( { device: 'android', version: '4.7' } );
	} );

	test( 'should return unknown for an any other user agent', () => {
		global.navigator = {
			userAgent:
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
		};

		expect( getMobileDeviceInfo() ).toStrictEqual( { device: 'unknown', version: 'unknown' } );
	} );

	test( 'should return the correct version for a release candidate', () => {
		global.navigator = {
			userAgent:
				'Mozilla/5.0 (Linux; Android 6.0; Android SDK built for x86_64 Build/MASTER; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/44.0.2403.119 Mobile Safari/537.36 wc-android/22.9.rc-1',
		};

		expect( getMobileDeviceInfo() ).toMatchObject( { version: '22.9.rc-1' } );
	} );
} );
