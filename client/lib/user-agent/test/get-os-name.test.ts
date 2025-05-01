import { getOsName } from '../get-os-name';

describe( 'getOsName', () => {
	const originalNavigatorDescriptor = Object.getOwnPropertyDescriptor( global, 'navigator' )!;
	const mockNavigator = { userAgent: '' };

	beforeEach( () => {
		Object.defineProperty( global, 'navigator', {
			value: mockNavigator,
			configurable: true,
		} );
	} );

	afterEach( () => {
		Object.defineProperty( global, 'navigator', originalNavigatorDescriptor );
	} );

	test( 'should return iOS when using an iPhone user agent', () => {
		mockNavigator.userAgent =
			'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';

		expect( getOsName() ).toBe( 'iOS' );
	} );

	test( 'should return iOS when using an iPad user agent', () => {
		mockNavigator.userAgent =
			'Mozilla/5.0 (iPad; CPU OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';

		expect( getOsName() ).toBe( 'iOS' );
	} );

	test( 'should return Android when using an Android user agent', () => {
		mockNavigator.userAgent =
			'Mozilla/5.0 (Linux; Android 11; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36';

		expect( getOsName() ).toBe( 'Android' );
	} );

	test( 'should return Windows when using a Windows user agent', () => {
		mockNavigator.userAgent =
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.61 Safari/537.36';

		expect( getOsName() ).toBe( 'Windows' );
	} );
} );
