import { isRedirectAllowed } from '../url';

describe( 'isRedirectAllowed', () => {
	test( 'should return true for relative URLs', () => {
		const relativePaths = [ '/me/billing/purchases', '/some/path', 'relative/path' ];

		relativePaths.forEach( ( url ) => {
			expect( isRedirectAllowed( url ) ).toBe( true );
		} );
	} );

	test( 'should return true for valid dashboard origins', () => {
		const validUrls = [
			'https://my.wordpress.com/me/billing',
			'https://my.wordpress.com/path?query=value',
			'https://my.woo.ai/some/page',
			'http://my.localhost:3000/me/billing',
			'http://my.woo.localhost:3000/path',
		];

		validUrls.forEach( ( url ) => {
			expect( isRedirectAllowed( url ) ).toBe( true );
		} );
	} );

	test( 'should return true when URL hostname matches trusted domain', () => {
		expect(
			isRedirectAllowed(
				'https://mystore.commerce-garden.com/wp-admin/',
				'mystore.commerce-garden.com'
			)
		).toBe( true );

		expect(
			isRedirectAllowed( 'https://custom-domain.com/path?query=value', 'custom-domain.com' )
		).toBe( true );
	} );

	test( 'should return false when URL hostname does not match trusted domain', () => {
		expect( isRedirectAllowed( 'https://evil.com/wp-admin/', 'mystore.commerce-garden.com' ) ).toBe(
			false
		);

		expect(
			isRedirectAllowed(
				'https://mystore.commerce-garden.com.evil.com/path',
				'mystore.commerce-garden.com'
			)
		).toBe( false );
	} );

	test( 'should return false for empty input', () => {
		expect( isRedirectAllowed( '' ) ).toBe( false );
	} );

	test( 'should return false for malicious lookalike domains', () => {
		const maliciousUrls = [
			'https://my.wordpress.comedy',
			'https://my.wordpress.com.evil.com',
			'https://my.wordpress.com.evil.com/path',
			'https://my.woo.aight',
			'https://my.woo.ai.evil.com',
			'https://evil.com?my.wordpress.com',
			'https://my.wordpress.com@evil.com',
		];

		maliciousUrls.forEach( ( url ) => {
			expect( isRedirectAllowed( url ) ).toBe( false );
		} );
	} );

	test( 'should return false for dangerous protocols', () => {
		const dangerousUrls = [
			'javascript:alert(1)',
			'data:text/html,<script>alert(1)</script>',
			'vbscript:alert(1)',
		];

		dangerousUrls.forEach( ( url ) => {
			expect( isRedirectAllowed( url ) ).toBe( false );
		} );
	} );

	test( 'should return false for protocol-relative URLs', () => {
		expect( isRedirectAllowed( '//evil.com' ) ).toBe( false );
		expect( isRedirectAllowed( '//evil.com/path' ) ).toBe( false );
	} );

	test( 'should return false for URLs with whitespace prefix', () => {
		const whitespaceUrls = [
			'\nhttps://evil.com',
			'\rhttps://evil.com',
			'\thttps://evil.com',
			' https://evil.com',
		];

		whitespaceUrls.forEach( ( url ) => {
			expect( isRedirectAllowed( url ) ).toBe( false );
		} );
	} );

	test( 'should handle URLs with various components correctly', () => {
		const complexUrls = [
			'https://my.wordpress.com:443/path',
			'https://my.wordpress.com/path?query=value#hash',
			'https://my.wordpress.com/path?back=https://wordpress.com',
		];

		complexUrls.forEach( ( url ) => {
			expect( isRedirectAllowed( url ) ).toBe( true );
		} );
	} );

	test( 'should handle empty trusted domain safely', () => {
		expect( isRedirectAllowed( 'https://evil.com', '' ) ).toBe( false );
		expect( isRedirectAllowed( 'https://evil.com', undefined ) ).toBe( false );
	} );
} );
