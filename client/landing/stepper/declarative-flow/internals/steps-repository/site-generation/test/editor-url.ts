/**
 * @jest-environment jsdom
 */

import { getLiveEditorUrl, getSafeEditorUrl } from '../editor-url';

describe( 'getSafeEditorUrl', () => {
	it( 'returns null for a missing value', () => {
		expect( getSafeEditorUrl( null ) ).toBeNull();
		expect( getSafeEditorUrl( '' ) ).toBeNull();
	} );

	it( 'resolves relative paths against the current origin', () => {
		expect( getSafeEditorUrl( '/wp-admin/site-editor.php?spec_id=spec-1' ) ).toBe(
			'https://example.com/wp-admin/site-editor.php?spec_id=spec-1'
		);
	} );

	it( 'allows wordpress.com and its subdomains', () => {
		expect( getSafeEditorUrl( 'https://wordpress.com/setup' ) ).toBe(
			'https://wordpress.com/setup'
		);
		expect( getSafeEditorUrl( 'https://example.wordpress.com/wp-admin/site-editor.php' ) ).toBe(
			'https://example.wordpress.com/wp-admin/site-editor.php'
		);
	} );

	it( 'rejects insecure wordpress.com destinations', () => {
		expect( getSafeEditorUrl( 'http://wordpress.com/wp-admin/' ) ).toBeNull();
		expect(
			getSafeEditorUrl( 'http://example.wordpress.com/wp-admin/site-editor.php' )
		).toBeNull();
	} );

	it( 'rejects HTTP for the current host when Calypso is using HTTPS', () => {
		expect( getSafeEditorUrl( 'http://example.com/wp-admin/site-editor.php' ) ).toBeNull();
	} );

	it( 'allows HTTP for the current host during local HTTP development', () => {
		const originalLocation = window.location;
		Object.defineProperty( window, 'location', {
			value: {
				hostname: 'localhost',
				origin: 'http://localhost:3000',
				protocol: 'http:',
			},
			configurable: true,
		} );

		try {
			expect( getSafeEditorUrl( 'http://localhost:3000/wp-admin/site-editor.php' ) ).toBe(
				'http://localhost:3000/wp-admin/site-editor.php'
			);
		} finally {
			Object.defineProperty( window, 'location', {
				value: originalLocation,
				configurable: true,
			} );
		}
	} );

	it( 'allows wpcomstaging.com subdomains', () => {
		expect( getSafeEditorUrl( 'https://example.wpcomstaging.com/wp-admin/' ) ).toBe(
			'https://example.wpcomstaging.com/wp-admin/'
		);
	} );

	it( 'rejects javascript: and data: schemes', () => {
		// eslint-disable-next-line no-script-url
		expect( getSafeEditorUrl( 'javascript:alert(1)' ) ).toBeNull();
		// eslint-disable-next-line no-script-url
		expect( getSafeEditorUrl( 'javascript://wordpress.com/%0aalert(1)' ) ).toBeNull();
		expect( getSafeEditorUrl( 'data:text/html,<script>alert(1)</script>' ) ).toBeNull();
	} );

	it( 'rejects hosts outside the allowlist', () => {
		expect( getSafeEditorUrl( 'https://evil.example/phishing' ) ).toBeNull();
		expect( getSafeEditorUrl( 'https://evilwordpress.com/' ) ).toBeNull();
		expect( getSafeEditorUrl( 'https://wordpress.com.evil.example/' ) ).toBeNull();
	} );
} );

describe( 'getLiveEditorUrl', () => {
	const captured =
		'https://example.wordpress.com/wp-admin/site-editor.php?easy-mode=true&source=dashboard';
	const live =
		'https://example.wordpress.com/wp-admin/site-editor.php?easy-mode=true&p=%2Fpage%2F12&canvas=edit';

	it( 'prefers the live URL and carries over the query args the flow added', () => {
		const url = new URL( getLiveEditorUrl( captured, live ) );

		expect( url.origin + url.pathname ).toBe(
			'https://example.wordpress.com/wp-admin/site-editor.php'
		);
		expect( url.searchParams.get( 'p' ) ).toBe( '/page/12' );
		expect( url.searchParams.get( 'canvas' ) ).toBe( 'edit' );
		expect( url.searchParams.get( 'easy-mode' ) ).toBe( 'true' );
		expect( url.searchParams.get( 'source' ) ).toBe( 'dashboard' );
		// Not duplicated: the live URL's own value wins for a shared key.
		expect( url.searchParams.getAll( 'easy-mode' ) ).toEqual( [ 'true' ] );
	} );

	it( 'keeps the route encoded the way the site editor documents it', () => {
		expect( getLiveEditorUrl( captured, live ) ).toContain( 'p=%2Fpage%2F12' );
	} );

	it( 'falls back to the captured URL when the response carries none', () => {
		expect( getLiveEditorUrl( captured, undefined ) ).toBe( captured );
		expect( getLiveEditorUrl( captured, '' ) ).toBe( captured );
		expect( getLiveEditorUrl( captured, 42 ) ).toBe( captured );
	} );

	it( 'falls back to the captured URL when the live URL fails the host allowlist', () => {
		expect( getLiveEditorUrl( captured, 'https://evil.example/wp-admin/site-editor.php' ) ).toBe(
			captured
		);
	} );
} );
