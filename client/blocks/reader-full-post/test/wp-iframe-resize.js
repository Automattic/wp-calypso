/**
 * @jest-environment jsdom
 */
import WPiFrameResize from '../wp-iframe-resize';

const SECRET = 'abc123XYZ0';
const IFRAME_SRC = 'https://embeds.example.net/frame.html#?secret=' + SECRET;
const TOP_URL = 'https://example.com/read/blogs/1/posts/2';

describe( 'WPiFrameResize', () => {
	let wrapper;
	let iframe;
	let stopResize;
	let topLocation;

	const postMessageFromIframe = ( data, source = iframe.contentWindow ) => {
		window.dispatchEvent( new MessageEvent( 'message', { data, source } ) );
	};

	beforeEach( () => {
		wrapper = document.createElement( 'div' );
		document.body.appendChild( wrapper );

		iframe = document.createElement( 'iframe' );
		iframe.setAttribute( 'data-secret', SECRET );
		iframe.setAttribute( 'src', IFRAME_SRC );
		wrapper.appendChild( iframe );

		topLocation = { href: TOP_URL };
		Object.defineProperty( window, 'top', {
			configurable: true,
			value: { location: topLocation },
		} );

		iframe.focus();
		stopResize = WPiFrameResize( wrapper );
	} );

	afterEach( () => {
		stopResize();
		wrapper.remove();
		delete window.top;
	} );

	it( 'resizes the iframe on a height message', () => {
		postMessageFromIframe( { secret: SECRET, message: 'height', value: 300 } );

		expect( iframe.height ).toBe( '300' );
	} );

	it( 'caps the iframe height at 1000px', () => {
		postMessageFromIframe( { secret: SECRET, message: 'height', value: 5000 } );

		expect( iframe.height ).toBe( '1000' );
	} );

	it( 'navigates the top window to a same-host link', () => {
		postMessageFromIframe( {
			secret: SECRET,
			message: 'link',
			value: 'https://embeds.example.net/some-post',
		} );

		expect( topLocation.href ).toBe( 'https://embeds.example.net/some-post' );
	} );

	it.each( [
		[
			'a javascript: target spoofing the iframe host',
			"javascript://embeds.example.net/%0Avoid(document.documentElement.setAttribute('data-reader-xss','MARKER'))",
		],
		[ 'a data: target spoofing the iframe host', 'data://embeds.example.net/x' ],
		[ 'a vbscript: target spoofing the iframe host', 'vbscript://embeds.example.net/x' ],
		[ 'credentials for the iframe host', 'https://user:password@embeds.example.net/some-post' ],
		[ 'a different host', 'https://attacker.example/some-post' ],
		[ 'a relative URL', '/me/account' ],
		[ 'an unparseable URL', 'https://' ],
	] )( 'does not navigate the top window for a link message with %s', ( _label, value ) => {
		postMessageFromIframe( { secret: SECRET, message: 'link', value } );

		expect( topLocation.href ).toBe( TOP_URL );
	} );

	it( 'navigates the top window to an http link on the iframe host', () => {
		postMessageFromIframe( {
			secret: SECRET,
			message: 'link',
			value: 'http://embeds.example.net/some-post',
		} );

		expect( topLocation.href ).toBe( 'http://embeds.example.net/some-post' );
	} );

	it( 'does not navigate for a link message from another window', () => {
		postMessageFromIframe(
			{ secret: SECRET, message: 'link', value: 'https://embeds.example.net/some-post' },
			window
		);

		expect( topLocation.href ).toBe( TOP_URL );
	} );

	it( 'does not navigate for a link message carrying the wrong secret', () => {
		postMessageFromIframe( {
			secret: 'wrongsecret',
			message: 'link',
			value: 'https://embeds.example.net/some-post',
		} );

		expect( topLocation.href ).toBe( TOP_URL );
	} );

	it( 'does not navigate for a link message from an unfocused iframe', () => {
		iframe.blur();

		postMessageFromIframe( {
			secret: SECRET,
			message: 'link',
			value: 'https://embeds.example.net/some-post',
		} );

		expect( topLocation.href ).toBe( TOP_URL );
	} );
} );
