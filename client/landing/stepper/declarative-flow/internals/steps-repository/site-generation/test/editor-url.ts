/**
 * @jest-environment jsdom
 */

import { getSafeEditorUrl } from '../editor-url';

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
