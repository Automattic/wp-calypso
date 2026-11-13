const {
	isAppleLoginCallback,
} = require( '../../app/window-handlers/external-links/apple-login-callback' );

describe( 'isAppleLoginCallback', () => {
	it.each( [
		'https://wordpress.com/log-in/apple/callback',
		'https://wordpress.com/log-in/apple/callback?code=abc',
	] )( 'matches the Apple login callback: %p', ( url ) => {
		expect( isAppleLoginCallback( url ) ).toBe( true );
	} );

	it.each( [
		'https://example.com/?next=https://wordpress.com/log-in/apple/callback',
		'https://example.com/https://wordpress.com/log-in/apple/callback',
		'https://wordpress.com.example.com/log-in/apple/callback',
		'http://wordpress.com/log-in/apple/callback',
		'https://wordpress.com/log-in',
		'',
	] )( 'does not match other URLs: %p', ( url ) => {
		expect( isAppleLoginCallback( url ) ).toBe( false );
	} );
} );
