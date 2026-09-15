/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import EmbedContainer from '../';

jest.mock( '@automattic/load-script', () => ( {
	loadScript: jest.fn(),
	loadjQueryDependentScript: jest.fn(),
} ) );

function renderContent( html ) {
	return render(
		<EmbedContainer>
			{ /* eslint-disable-next-line react/no-danger */ }
			<div dangerouslySetInnerHTML={ { __html: html } } />
		</EmbedContainer>
	);
}

/**
 * Stand-in for the embed runtimes we load: read a value back out of the DOM and interpolate it
 * into an HTML string, the way the Issuu loader builds its iframe from `data-configid`.
 * @param {string|null} value an attribute value as returned by getAttribute()
 * @returns {window.Element} the element produced by the second parse
 */
function parseAsEmbedRuntimeWould( value ) {
	const host = document.createElement( 'div' );
	host.innerHTML = `<iframe src="https://e.issuu.com/embed#${ value }"></iframe>`;
	return host.firstElementChild;
}

/**
 * Stand-in for the slideshow shortcode script, which assigns each slide caption to innerHTML.
 * @param {string} caption a caption as it comes back out of the sanitized payload
 * @returns {Array<string>} the tag names the caption parsed into
 */
function parseAsSlideshowCaptionWould( caption ) {
	const host = document.createElement( 'div' );
	host.innerHTML = caption;
	return Array.from( host.querySelectorAll( '*' ) ).map( ( node ) => node.tagName );
}

const ATTRIBUTE_BREAKOUT = 'safe&quot; onload=&quot;window.__xss = 1&quot; x=&quot;';

// Breakouts aimed at the caption sink, including the mutation-XSS shapes that survive a naive
// tag strip by relying on the parser re-opening a tag the stripper thought it had closed.
const CAPTION_BREAKOUTS = [
	'<img src=x onerror=alert(1)>',
	'<img src=x onerror=alert(1)',
	'<<img src=x onerror=alert(1)>',
	'<img src=x onerror=alert(1) alt="a>b">',
	'<scr<script>ipt>alert(1)</script>',
	'<svg/onload=alert(1)>',
	'<math><mtext><table><mglyph><style><img src=x onerror=alert(1)>',
	'<noscript><p title="</noscript><img src=x onerror=alert(1)>">',
	'<form><math><mtext></form><form><mglyph><style></math><img src onerror=alert(1)>',
	'<template><img src=x onerror=alert(1)></template>',
	'<base href="//example.com/">',
];

describe( 'EmbedContainer', () => {
	test( 'the reference runtime turns an entity-encoded quote into an event handler', () => {
		const carrier = document.createElement( 'div' );
		carrier.innerHTML = `<div data-configid="${ ATTRIBUTE_BREAKOUT }"></div>`;

		const iframe = parseAsEmbedRuntimeWould(
			carrier.firstElementChild.getAttribute( 'data-configid' )
		);

		expect( iframe.getAttribute( 'onload' ) ).toBe( 'window.__xss = 1' );
	} );

	test( 'drops data attributes that would break out of their attribute on a second parse', () => {
		const { container } = renderContent(
			`<div class="embed-issuu issuuembed" data-configid="${ ATTRIBUTE_BREAKOUT }">inert</div>`
		);

		const embed = container.querySelector( '.issuuembed' );
		expect( embed.getAttribute( 'data-configid' ) ).toBeNull();
		expect( parseAsEmbedRuntimeWould( embed.getAttribute( 'data-configid' ) ).attributes ).toEqual(
			expect.not.arrayContaining( [ expect.objectContaining( { name: 'onload' } ) ] )
		);
	} );

	test( 'applies to every embed we hand to a third party, not just Issuu', () => {
		const { container } = renderContent(
			`<blockquote class="tiktok-embed embed-tiktok" data-video-id="${ ATTRIBUTE_BREAKOUT }"></blockquote>
			<div class="fb-post" data-href="${ ATTRIBUTE_BREAKOUT }"></div>
			<a data-pin-do="embedPin" href="https://pinterest.com/pin/1/" data-pin-id="${ ATTRIBUTE_BREAKOUT }"></a>`
		);

		expect( container.querySelector( '.tiktok-embed' ).hasAttribute( 'data-video-id' ) ).toBe(
			false
		);
		expect( container.querySelector( '.fb-post' ).hasAttribute( 'data-href' ) ).toBe( false );
		expect( container.querySelector( '[data-pin-do]' ).hasAttribute( 'data-pin-id' ) ).toBe(
			false
		);
	} );

	test( 'reaches data attributes on descendants of the embed', () => {
		const { container } = renderContent(
			`<div class="embed-reddit"><blockquote data-card-created="${ ATTRIBUTE_BREAKOUT }"></blockquote></div>`
		);

		expect( container.querySelector( 'blockquote' ).hasAttribute( 'data-card-created' ) ).toBe(
			false
		);
	} );

	test( 'drops values that could open an element rather than an attribute', () => {
		const { container } = renderContent(
			'<div class="embed-issuu issuuembed" data-configid="&lt;img src=x onerror=alert(1)&gt;"></div>'
		);

		expect( container.querySelector( '.issuuembed' ).hasAttribute( 'data-configid' ) ).toBe(
			false
		);
	} );

	test( 'keeps well-formed embed data attributes', () => {
		const { container } = renderContent(
			'<div class="embed-issuu issuuembed" data-configid="12345678/87654321"></div>'
		);

		expect( container.querySelector( '.issuuembed' ).getAttribute( 'data-configid' ) ).toBe(
			'12345678/87654321'
		);
	} );

	test( 'sanitizes nodes an embed runtime can reach without Calypso dispatching them', () => {
		// The runtimes scan the document for their own markers, so a node that carries the vendor
		// class but not the class our table matches on is still processed once the script loads.
		const { container } = renderContent(
			`<blockquote class="tiktok-embed" data-video-id="${ ATTRIBUTE_BREAKOUT }"></blockquote>`
		);

		expect( container.querySelector( '.tiktok-embed' ).hasAttribute( 'data-video-id' ) ).toBe(
			false
		);
	} );

	test( 'cannot be skipped by pre-setting the processed marker', () => {
		const { container } = renderContent(
			`<div class="embed-issuu issuuembed" data-wpcom-embed-processed="1" data-configid="${ ATTRIBUTE_BREAKOUT }"></div>`
		);

		expect( container.querySelector( '.issuuembed' ).hasAttribute( 'data-configid' ) ).toBe(
			false
		);
	} );

	test( 'keeps the JSON payload a Jetpack slideshow is built from', () => {
		const gallery = '[{&quot;src&quot;:&quot;https://example.com/a.jpg&quot;}]';
		const { container } = renderContent(
			`<div class="jetpack-slideshow" data-trans="fade" data-autostart="true" data-gallery="${ gallery }"></div>`
		);

		expect( container.querySelector( '.jetpack-slideshow' ).getAttribute( 'data-gallery' ) ).toBe(
			'[{"src":"https://example.com/a.jpg"}]'
		);
	} );

	test( 'flattens slideshow captions, which the shortcode script renders as HTML', () => {
		const gallery =
			'[{&quot;src&quot;:&quot;https://example.com/a.jpg&quot;,&quot;caption&quot;:&quot;&lt;img src=x onerror=alert(1)&gt;Spring&quot;}]';
		const { container } = renderContent(
			`<div class="jetpack-slideshow" data-gallery="${ gallery }"></div>`
		);

		const slides = JSON.parse(
			container.querySelector( '.jetpack-slideshow' ).getAttribute( 'data-gallery' )
		);
		expect( slides[ 0 ].caption ).toBe( 'Spring' );
		expect( slides[ 0 ].src ).toBe( 'https://example.com/a.jpg' );
	} );

	test.each( CAPTION_BREAKOUTS )(
		'leaves no element behind when a slideshow caption carries %j',
		( caption ) => {
			const gallery = JSON.stringify( [ { src: 'https://example.com/a.jpg', caption } ] );
			const { container } = renderContent(
				`<div class="jetpack-slideshow" data-gallery="${ gallery.replace(
					/"/g,
					'&quot;'
				) }"></div>`
			);

			const slides = JSON.parse(
				container.querySelector( '.jetpack-slideshow' ).getAttribute( 'data-gallery' )
			);
			expect( parseAsSlideshowCaptionWould( slides[ 0 ].caption ) ).toEqual( [] );
		}
	);

	test.each( [
		[ 'an array', [ '<img src=x onerror=alert(1)>' ] ],
		[ 'a nested object', { toString: '<img src=x onerror=alert(1)>' } ],
		[ 'an array of arrays', [ [ '<img src=x onerror=alert(1)>' ] ] ],
	] )( 'leaves no element behind when a slideshow caption is %s', ( _label, caption ) => {
		// innerHTML takes a string, so a non-string caption is coerced: an array of markup
		// joins back into that markup and is parsed as HTML.
		const gallery = JSON.stringify( [ { src: 'https://example.com/a.jpg', caption } ] );
		const { container } = renderContent(
			`<div class="jetpack-slideshow" data-gallery="${ gallery.replace( /"/g, '&quot;' ) }"></div>`
		);

		const slides = JSON.parse(
			container.querySelector( '.jetpack-slideshow' ).getAttribute( 'data-gallery' )
		);
		expect( parseAsSlideshowCaptionWould( slides[ 0 ].caption ) ).toEqual( [] );
		expect( slides[ 0 ].src ).toBe( 'https://example.com/a.jpg' );
	} );

	test( 'drops a slideshow payload that is not a gallery at all', () => {
		const { container } = renderContent(
			`<div class="jetpack-slideshow" data-gallery="${ ATTRIBUTE_BREAKOUT }"></div>`
		);

		expect( container.querySelector( '.jetpack-slideshow' ).hasAttribute( 'data-gallery' ) ).toBe(
			false
		);
	} );

	test( 'keeps gallery caption markup', () => {
		const { container } = renderContent(
			'<div class="wp-block-gallery"><figure class="wp-block-image"><img src="https://example.com/a.jpg" data-image-caption="&lt;p&gt;She said &quot;hello&quot;&lt;/p&gt;" /></figure></div>'
		);

		expect( container.querySelector( 'img' ).getAttribute( 'data-image-caption' ) ).toBe(
			'<p>She said "hello"</p>'
		);
	} );

	test( 'leaves attributes outside the data- namespace alone', () => {
		const { container } = renderContent(
			'<div class="embed-issuu issuuembed" title="She said &quot;hello&quot;"></div>'
		);

		expect( container.querySelector( '.issuuembed' ).getAttribute( 'title' ) ).toBe(
			'She said "hello"'
		);
	} );
} );
