/**
 * @jest-environment jsdom
 */

import { getEditorUrlFromStatus } from '../editor-url';

describe( 'getEditorUrlFromStatus', () => {
	it.each( [ 'example.wordpress.com', 'example.wpcomstaging.com', 'custom-domain.com' ] )(
		'preserves the API editor route on %s and adds source',
		( host ) => {
			const live = `https://${ host }/wp-admin/site-editor.php?easy-mode=true&from=site-generation&p=%2Fpage%2F12&canvas=edit`;
			expect( getEditorUrlFromStatus( live, 'sites-dashboard' ) ).toBe(
				`${ live }&source=sites-dashboard`
			);
			expect( getEditorUrlFromStatus( live ) ).toBe( live );
		}
	);

	it.each( [
		undefined,
		null,
		'',
		42,
		'not a URL',
		'/wp-admin/site-editor.php',
		'//custom-domain.com/wp-admin/site-editor.php',
		'http://example.com/wp-admin/site-editor.php',
		'http://example.wordpress.com/wp-admin/site-editor.php',
		// eslint-disable-next-line no-script-url
		'javascript:alert(1)',
		// eslint-disable-next-line no-script-url
		'javascript://wordpress.com/%0aalert(1)',
		'data:text/html,<script>alert(1)</script>',
	] )( 'rejects an unusable API destination: %p', ( url ) => {
		expect( getEditorUrlFromStatus( url ) ).toBeNull();
	} );

	it( 'allows HTTP for the current host during local HTTP development', () => {
		const originalLocation = window.location;
		Object.defineProperty( window, 'location', {
			value: { hostname: 'localhost', protocol: 'http:' },
			configurable: true,
		} );
		try {
			expect( getEditorUrlFromStatus( 'http://localhost:3000/wp-admin/site-editor.php' ) ).toBe(
				'http://localhost:3000/wp-admin/site-editor.php'
			);
			expect(
				getEditorUrlFromStatus( 'http://custom-domain.com/wp-admin/site-editor.php' )
			).toBeNull();
		} finally {
			Object.defineProperty( window, 'location', {
				value: originalLocation,
				configurable: true,
			} );
		}
	} );

	it( 'preserves an API-provided source', () => {
		const live = 'https://example.com/wp-admin/site-editor.php?source=api';
		expect( getEditorUrlFromStatus( live, 'sites-dashboard' ) ).toBe( live );
	} );

	it( 'encodes source as one parameter without injecting editor settings', () => {
		const live = 'https://example.com/wp-admin/site-editor.php';
		const url = new URL( getEditorUrlFromStatus( live, 'dashboard&spec_id=untrusted' ) ?? '' );
		expect( url.searchParams.get( 'source' ) ).toBe( 'dashboard&spec_id=untrusted' );
		expect( url.searchParams.has( 'spec_id' ) ).toBe( false );
	} );
} );
