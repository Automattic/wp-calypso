import isPassportRedirect from '../is-passport-redirect';

describe( 'isPassportRedirect', () => {
	test( 'should return false for null or empty input', () => {
		expect( isPassportRedirect( null ) ).toBe( false );
		expect( isPassportRedirect( '' ) ).toBe( false );
	} );

	test( 'should return true for valid Passport domains', () => {
		const validUrls = [
			'https://passport.online',
			'https://passport.online/path',
			'https://blog.passport.online',
			'https://subdomain.passport.online/path?query=value',
		];

		validUrls.forEach( ( url ) => {
			expect( isPassportRedirect( url ) ).toBe( true );
		} );
	} );

	test( 'should return false for invalid URLs', () => {
		const invalidUrls = [
			'not-a-url',
			'http:/passport.online', // Missing slash
			'ftp://passport.online', // Wrong protocol
			'http://passport.online', // Not HTTPS
		];

		invalidUrls.forEach( ( url ) => {
			expect( isPassportRedirect( url ) ).toBe( false );
		} );
	} );

	test( 'should return false for malicious lookalike domains', () => {
		const maliciousUrls = [
			'https://passport.online.evil.com',
			'https://passport.online@evil.com',
			'https://evil.com?passport.online',
			'https://fake-passport.online',
			'https://passportcom.com',
		];

		maliciousUrls.forEach( ( url ) => {
			expect( isPassportRedirect( url ) ).toBe( false );
		} );
	} );

	test( 'should handle URLs with various components correctly', () => {
		const complexUrls = [
			'https://passport.online:443/path',
			'https://passport.online/path?query=value#hash',
			'https://passport.online/path?back=https://wordpress.com',
			'https://blog.passport.online/path?complex=query&multiple=params',
		];

		complexUrls.forEach( ( url ) => {
			expect( isPassportRedirect( url ) ).toBe( true );
		} );
	} );
} );
