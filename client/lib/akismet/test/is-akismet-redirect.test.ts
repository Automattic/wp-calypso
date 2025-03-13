import isAkismetRedirect from '../is-akismet-redirect';

describe( 'isAkismetRedirect', () => {
	test( 'should return false for null or empty input', () => {
		expect( isAkismetRedirect( null ) ).toBe( false );
		expect( isAkismetRedirect( '' ) ).toBe( false );
	} );

	test( 'should return true for valid Akismet domains', () => {
		const validUrls = [
			'https://akismet.com',
			'https://akismet.com/path',
			'https://blog.akismet.com',
			'https://subdomain.akismet.com/path?query=value',
		];

		validUrls.forEach( ( url ) => {
			expect( isAkismetRedirect( url ) ).toBe( true );
		} );
	} );

	test( 'should return false for invalid URLs', () => {
		const invalidUrls = [
			'not-a-url',
			'http:/akismet.com', // Missing slash
			'ftp://akismet.com', // Wrong protocol
			'http://akismet.com', // Not HTTPS
		];

		invalidUrls.forEach( ( url ) => {
			expect( isAkismetRedirect( url ) ).toBe( false );
		} );
	} );

	test( 'should return false for malicious lookalike domains', () => {
		const maliciousUrls = [
			'https://akismet.com.evil.com',
			'https://akismet.com@evil.com',
			'https://evil.com?akismet.com',
			'https://fake-akismet.com',
			'https://akismetcom.com',
		];

		maliciousUrls.forEach( ( url ) => {
			expect( isAkismetRedirect( url ) ).toBe( false );
		} );
	} );

	test( 'should handle URLs with various components correctly', () => {
		const complexUrls = [
			'https://akismet.com:443/path',
			'https://akismet.com/path?query=value#hash',
			'https://akismet.com/path?back=https://wordpress.com',
			'https://blog.akismet.com/path?complex=query&multiple=params',
		];

		complexUrls.forEach( ( url ) => {
			expect( isAkismetRedirect( url ) ).toBe( true );
		} );
	} );
} );
