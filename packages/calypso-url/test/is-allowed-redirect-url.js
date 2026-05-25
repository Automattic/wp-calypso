import { isAllowedRedirectUrl } from '../src';

const allowedHostnames = [ 'wordpress.com', 'cloud.jetpack.com', 'akismet.com' ];

describe( 'isAllowedRedirectUrl', () => {
	describe( 'non-absolute URLs', () => {
		it( 'rejects absolute path URLs', () => {
			expect( isAllowedRedirectUrl( '/checkout/thank-you', allowedHostnames ) ).toBe( false );
		} );

		it( 'rejects protocol-relative URLs', () => {
			expect( isAllowedRedirectUrl( '//evil.com/path', allowedHostnames ) ).toBe( false );
		} );

		it( 'rejects path-relative URLs', () => {
			expect( isAllowedRedirectUrl( '../foo', allowedHostnames ) ).toBe( false );
		} );

		it( 'rejects empty string', () => {
			expect( isAllowedRedirectUrl( '', allowedHostnames ) ).toBe( false );
		} );
	} );

	describe( 'protocol validation', () => {
		it( 'allows https URLs with allowed hostname', () => {
			expect( isAllowedRedirectUrl( 'https://wordpress.com/page', allowedHostnames ) ).toBe( true );
		} );

		it( 'allows http URLs with allowed hostname', () => {
			expect( isAllowedRedirectUrl( 'http://wordpress.com/page', allowedHostnames ) ).toBe( true );
		} );

		it( 'rejects javascript: URLs even with allowed hostname', () => {
			expect(
				isAllowedRedirectUrl( 'javascript://wordpress.com/%0aalert(1)', allowedHostnames )
			).toBe( false );
		} );

		it( 'rejects data: URLs', () => {
			expect(
				isAllowedRedirectUrl( 'data:text/html,<script>alert(1)</script>', allowedHostnames )
			).toBe( false );
		} );

		it( 'rejects ftp: URLs even with allowed hostname', () => {
			expect( isAllowedRedirectUrl( 'ftp://wordpress.com/file', allowedHostnames ) ).toBe( false );
		} );
	} );

	describe( 'hostname validation', () => {
		it( 'allows URLs with hostnames in the allowlist', () => {
			expect( isAllowedRedirectUrl( 'https://cloud.jetpack.com/pricing', allowedHostnames ) ).toBe(
				true
			);
		} );

		it( 'rejects URLs with hostnames not in the allowlist', () => {
			expect( isAllowedRedirectUrl( 'https://evil.com/page', allowedHostnames ) ).toBe( false );
		} );
	} );

	describe( 'hostname patterns', () => {
		const patterns = [ /^([a-zA-Z0-9-]+\.)?calypso\.live$/ ];

		it( 'allows URLs matching a hostname pattern', () => {
			expect( isAllowedRedirectUrl( 'https://my-branch.calypso.live/page', [], patterns ) ).toBe(
				true
			);
		} );

		it( 'allows bare pattern domain', () => {
			expect( isAllowedRedirectUrl( 'https://calypso.live/page', [], patterns ) ).toBe( true );
		} );

		it( 'rejects javascript: URLs even with matching pattern hostname', () => {
			expect( isAllowedRedirectUrl( 'javascript://calypso.live/%0aalert(1)', [], patterns ) ).toBe(
				false
			);
		} );
	} );

	describe( 'edge cases', () => {
		it( 'rejects javascript: without hostname', () => {
			expect( isAllowedRedirectUrl( 'javascript:alert(1)', allowedHostnames ) ).toBe( false );
		} );

		it( 'normalizes hostname case — uppercase hostname matches allowlist', () => {
			expect( isAllowedRedirectUrl( 'https://WORDPRESS.COM/page', allowedHostnames ) ).toBe( true );
		} );
	} );

	describe( 'malformed URLs', () => {
		it( 'rejects malformed URLs', () => {
			expect( isAllowedRedirectUrl( 'not-a-url', allowedHostnames ) ).toBe( false );
		} );

		it( 'rejects invalid URLs', () => {
			expect( isAllowedRedirectUrl( '///', allowedHostnames ) ).toBe( false );
		} );
	} );
} );
