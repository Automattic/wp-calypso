const { resolveWindowOpen } = require( '../../app/window-handlers/external-links/window-open' );

// Electron's default for target="_blank" links and window.open() is a bare standalone window,
// which made links like the dashboard's "WP Admin" look broken (DOTAPP-16). Keep them in the main view.
describe( 'resolveWindowOpen', () => {
	it( 'loads regular URLs in the main view', () => {
		const url = 'https://example.wordpress.com/wp-admin/';
		expect( resolveWindowOpen( url, '' ) ).toEqual( { action: 'deny', urlToLoad: url } );
	} );

	it.each( [ 'about:blank', '' ] )( 'falls back to the hovered link for %p', ( url ) => {
		const targetURL = 'https://example.wordpress.com/?p=1&preview=true';
		expect( resolveWindowOpen( url, targetURL ) ).toEqual( {
			action: 'deny',
			urlToLoad: targetURL,
		} );
	} );

	it( 'allows the Google social login popup', () => {
		const url = 'https://accounts.google.com/o/oauth2/auth?client_id=abc';
		expect( resolveWindowOpen( url, '' ) ).toEqual( { action: 'allow' } );
	} );
} );
