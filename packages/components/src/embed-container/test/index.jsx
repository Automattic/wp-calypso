/**
 * @jest-environment jsdom
 */
/* eslint-disable react/no-danger -- the point of these tests is to feed the component raw post markup. */
import { render, waitFor } from '@testing-library/react';
import EmbedContainer from '../';

jest.mock( '@automattic/load-script', () => ( {
	loadScript: jest.fn(),
	loadjQueryDependentScript: jest.fn(),
} ) );

const { loadScript, loadjQueryDependentScript } = jest.requireMock( '@automattic/load-script' );

const INSTAGRAM_SCRIPT = 'https://platform.instagram.com/en_US/embeds.js';
const INSTAGRAM_PERMALINK = 'https://www.instagram.com/p/BnMO9vRleEx/';
const JAVASCRIPT_URL = 'javascript:fetch( "/me" ).then( ( r ) => r.text() )//';

// An https URL that a provider interpolating it into an HTML string would let escape its attribute.
const QUOTED_URL = 'https://example.com/?a=1" onload="window.__xss = 1" x="';

const ATTRIBUTE_BREAKOUT = 'safe&quot; onload=&quot;window.__xss = 1&quot; x=&quot;';

function renderContent( ...contents ) {
	const { container } = render(
		<EmbedContainer>
			{ contents.map( ( content, index ) => (
				<div key={ index } dangerouslySetInnerHTML={ { __html: content } } />
			) ) }
		</EmbedContainer>
	);
	return container;
}

function loadedScripts() {
	return loadScript.mock.calls.map( ( [ url ] ) => url );
}

/**
 * Stand-in for the embed runtimes we load: read a value back out of the DOM and interpolate it into
 * an HTML string, the way the Issuu loader builds its iframe from `data-configid`.
 * @param {string|null} value - An attribute value as returned by getAttribute().
 * @returns {Element} The element produced by the second parse.
 */
function parseAsEmbedRuntimeWould( value ) {
	const host = document.createElement( 'div' );
	host.innerHTML = `<iframe src="https://e.issuu.com/embed#${ value }"></iframe>`;
	return host.firstElementChild;
}

/**
 * Stand-in for the slideshow shortcode script, which assigns each slide caption to innerHTML.
 * @param {string} caption - A caption as it comes back out of the sanitized payload.
 * @returns {Element} The element the caption was parsed into.
 */
function renderCaptionAsHtml( caption ) {
	const element = document.createElement( 'div' );
	element.innerHTML = caption;
	return element;
}

/**
 * Build the `data-gallery` attribute Jetpack's slideshow shortcode emits: JSON, with the characters
 * that matter to the HTML parser encoded as entities. Nothing in the result is a literal element,
 * so it reaches the Reader intact.
 * @param {Array} gallery - Slides to encode.
 * @returns {string} Post markup holding a slideshow container.
 */
function slideshowMarkup( gallery ) {
	const attribute = JSON.stringify( gallery )
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		.replace( /"/g, '&quot;' )
		.replace( /'/g, '&#039;' );

	return `<div class="jetpack-slideshow" data-trans="fade" data-autostart="false" data-gallery="${ attribute }"></div>`;
}

beforeEach( () => {
	loadScript.mockReset();
	loadjQueryDependentScript.mockReset();
} );

describe( 'EmbedContainer', () => {
	describe( 'attributes a provider turns into a frame URL', () => {
		it( 'keeps a canonical Instagram permalink and hands the embed to the provider script', () => {
			const container = renderContent(
				`<blockquote class="instagram-media" data-instgrm-permalink="${ INSTAGRAM_PERMALINK }">post</blockquote>`
			);

			expect(
				container.querySelector( 'blockquote' ).getAttribute( 'data-instgrm-permalink' )
			).toBe( INSTAGRAM_PERMALINK );
			expect( loadedScripts() ).toContain( INSTAGRAM_SCRIPT );
		} );

		it( 'drops a javascript: permalink', () => {
			const container = renderContent(
				`<blockquote class="instagram-media" data-instgrm-permalink="${ JAVASCRIPT_URL }">post</blockquote>`
			);

			expect(
				container.querySelector( 'blockquote' ).hasAttribute( 'data-instgrm-permalink' )
			).toBe( false );
		} );

		it( 'drops a javascript: permalink hidden behind leading whitespace', () => {
			const container = renderContent(
				`<blockquote class="instagram-media" data-instgrm-permalink="  &#9;&#10;${ JAVASCRIPT_URL }">post</blockquote>`
			);

			expect(
				container.querySelector( 'blockquote' ).hasAttribute( 'data-instgrm-permalink' )
			).toBe( false );
		} );

		it( 'drops a permalink pointing away from Instagram', () => {
			const container = renderContent(
				'<blockquote class="instagram-media" data-instgrm-permalink="https://example.com/p/1/">post</blockquote>'
			);

			expect(
				container.querySelector( 'blockquote' ).hasAttribute( 'data-instgrm-permalink' )
			).toBe( false );
		} );

		it( 'drops a javascript: permalink on a node the provider scans but we do not process', () => {
			// `blockquote[class^="instagram-"]` misses this node, but Instagram's own
			// `.instagram-media` scan of the document does not.
			const container = renderContent(
				`<blockquote class="wp-block-embed instagram-media" data-instgrm-permalink="${ JAVASCRIPT_URL }">post</blockquote>`
			);

			expect(
				container.querySelector( 'blockquote' ).hasAttribute( 'data-instgrm-permalink' )
			).toBe( false );
		} );

		it( 'cleans every content root, not just the one holding a recognised embed', () => {
			const container = renderContent(
				`<blockquote class="instagram-media" data-instgrm-permalink="${ INSTAGRAM_PERMALINK }">real</blockquote>`,
				`<blockquote class="instagram-media" data-instgrm-permalink="${ JAVASCRIPT_URL }">attack</blockquote>`
			);

			const permalinks = Array.from( container.querySelectorAll( '[data-instgrm-permalink]' ) ).map(
				( node ) => node.getAttribute( 'data-instgrm-permalink' )
			);
			expect( permalinks ).toEqual( [ INSTAGRAM_PERMALINK ] );
		} );

		it.each( [
			[ 'data-href', '<div class="fb-post" data-href="%s"></div>', 'https://www.facebook.com/p/1' ],
			[
				'data-url',
				'<div class="calendly-inline-widget" data-url="%s"></div>',
				'https://calendly.com/example',
			],
			[
				'cite',
				'<blockquote class="tiktok-embed embed-tiktok" cite="%s"></blockquote>',
				'https://www.tiktok.com/@example/video/1',
			],
		] )( 'drops a javascript: %s but keeps an https one', ( attribute, markup, safeUrl ) => {
			const unsafe = renderContent( markup.replace( '%s', JAVASCRIPT_URL ) );
			expect( unsafe.querySelector( `[${ attribute }]` ) ).toBeNull();

			const safe = renderContent( markup.replace( '%s', safeUrl ) );
			expect( safe.querySelector( `[${ attribute }]` ).getAttribute( attribute ) ).toBe( safeUrl );
		} );

		it.each( [
			[ 'data-href', '<div class="fb-post" data-href="%s"></div>' ],
			[ 'cite', '<blockquote class="tiktok-embed embed-tiktok" cite="%s"></blockquote>' ],
		] )( 'drops an https %s carrying a quote', ( attribute, markup ) => {
			// A URL attribute can parse as a perfectly good https URL and still hold the quote that
			// ends the attribute a provider is building around it.
			const container = renderContent(
				markup.replace( '%s', QUOTED_URL.replace( /"/g, '&quot;' ) )
			);

			expect( container.querySelector( `[${ attribute }]` ) ).toBeNull();
		} );
	} );

	describe( 'data attributes a provider reads back and reparses', () => {
		it( 'the reference runtime turns an entity-encoded quote into an event handler', () => {
			const carrier = document.createElement( 'div' );
			carrier.innerHTML = `<div data-configid="${ ATTRIBUTE_BREAKOUT }"></div>`;

			const iframe = parseAsEmbedRuntimeWould(
				carrier.firstElementChild.getAttribute( 'data-configid' )
			);

			expect( iframe.getAttribute( 'onload' ) ).toBe( 'window.__xss = 1' );
		} );

		it( 'drops data attributes that would break out of their attribute on a second parse', () => {
			const container = renderContent(
				`<div class="embed-issuu issuuembed" data-configid="${ ATTRIBUTE_BREAKOUT }">inert</div>`
			);

			const embed = container.querySelector( '.issuuembed' );
			expect( embed.getAttribute( 'data-configid' ) ).toBeNull();
			expect(
				parseAsEmbedRuntimeWould( embed.getAttribute( 'data-configid' ) ).attributes
			).toEqual( expect.not.arrayContaining( [ expect.objectContaining( { name: 'onload' } ) ] ) );
		} );

		it( 'applies to every embed we hand to a third party, not just Issuu', () => {
			const container = renderContent(
				`<blockquote class="tiktok-embed embed-tiktok" data-video-id="${ ATTRIBUTE_BREAKOUT }"></blockquote>
				<a data-pin-do="embedPin" href="https://pinterest.com/pin/1/" data-pin-id="${ ATTRIBUTE_BREAKOUT }"></a>`
			);

			expect( container.querySelector( '.tiktok-embed' ).hasAttribute( 'data-video-id' ) ).toBe(
				false
			);
			expect( container.querySelector( '[data-pin-do]' ).hasAttribute( 'data-pin-id' ) ).toBe(
				false
			);
		} );

		it( 'reaches data attributes on descendants of the embed', () => {
			const container = renderContent(
				`<div class="embed-reddit"><blockquote data-card-created="${ ATTRIBUTE_BREAKOUT }"></blockquote></div>`
			);

			expect( container.querySelector( 'blockquote' ).hasAttribute( 'data-card-created' ) ).toBe(
				false
			);
		} );

		it( 'drops values that could open an element rather than an attribute', () => {
			const container = renderContent(
				'<div class="embed-issuu issuuembed" data-configid="&lt;img src=x onerror=alert(1)&gt;"></div>'
			);

			expect( container.querySelector( '.issuuembed' ).hasAttribute( 'data-configid' ) ).toBe(
				false
			);
		} );

		it( 'keeps well-formed embed data attributes', () => {
			const container = renderContent(
				'<div class="embed-issuu issuuembed" data-configid="12345678/87654321"></div>'
			);

			expect( container.querySelector( '.issuuembed' ).getAttribute( 'data-configid' ) ).toBe(
				'12345678/87654321'
			);
		} );

		it( 'sanitizes nodes an embed runtime can reach without Calypso dispatching them', () => {
			// The runtimes scan the document for their own markers, so a node that carries the vendor
			// class but not the class our table matches on is still processed once the script loads.
			const container = renderContent(
				`<blockquote class="tiktok-embed" data-video-id="${ ATTRIBUTE_BREAKOUT }"></blockquote>`
			);

			expect( container.querySelector( '.tiktok-embed' ).hasAttribute( 'data-video-id' ) ).toBe(
				false
			);
		} );

		it( 'cannot be skipped by pre-setting the processed marker', () => {
			const container = renderContent(
				`<div class="embed-issuu issuuembed" data-wpcom-embed-processed="1" data-configid="${ ATTRIBUTE_BREAKOUT }"></div>`
			);

			expect( container.querySelector( '.issuuembed' ).hasAttribute( 'data-configid' ) ).toBe(
				false
			);
		} );

		it( 'keeps gallery caption markup', () => {
			const container = renderContent(
				'<div class="wp-block-gallery"><figure class="wp-block-image"><img src="https://example.com/a.jpg" data-image-caption="&lt;p&gt;She said &quot;hello&quot;&lt;/p&gt;" /></figure></div>'
			);

			expect( container.querySelector( 'img' ).getAttribute( 'data-image-caption' ) ).toBe(
				'<p>She said "hello"</p>'
			);
		} );

		it( 'leaves attributes outside the data- namespace alone', () => {
			const container = renderContent(
				'<div class="embed-issuu issuuembed" title="She said &quot;hello&quot;"></div>'
			);

			expect( container.querySelector( '.issuuembed' ).getAttribute( 'title' ) ).toBe(
				'She said "hello"'
			);
		} );
	} );

	describe( 'Jetpack slideshows', () => {
		// The gallery data of each slideshow as JetpackSlideshow sees it, read when the slideshow
		// script is told to initialize. That is the last moment at which sanitizing still helps.
		let galleriesAtInit;

		beforeEach( () => {
			galleriesAtInit = null;
			loadScript.mockImplementation( ( url, callback ) => callback() );
			loadjQueryDependentScript.mockImplementation( ( url, callback ) => callback() );

			const jQuery = jest.fn( () => ( {
				trigger: () => {
					galleriesAtInit = Array.from( document.querySelectorAll( '.jetpack-slideshow' ) ).map(
						( node ) => node.getAttribute( 'data-gallery' )
					);
				},
			} ) );
			jQuery.prototype.cycle = () => {};
			window.jQuery = jQuery;
		} );

		afterEach( () => {
			delete window.jQuery;
			delete window.__captionHandlerFired;
		} );

		const renderSlideshows = async ( ...galleries ) => {
			renderContent( ...galleries.map( slideshowMarkup ) );
			await waitFor( () => expect( galleriesAtInit ).not.toBeNull() );
		};

		it( 'keeps a caption readable', async () => {
			await renderSlideshows( [
				{ src: 'https://example.com/1.jpg', caption: 'A view of the harbour' },
			] );

			const [ slide ] = JSON.parse( galleriesAtInit[ 0 ] );
			expect( renderCaptionAsHtml( slide.caption ).textContent ).toBe( 'A view of the harbour' );
		} );

		it( 'keeps the entities wptexturize() leaves in a caption readable', async () => {
			await renderSlideshows( [
				{ src: 'https://example.com/1.jpg', caption: 'The harbour&#8217;s best view' },
			] );

			const [ slide ] = JSON.parse( galleriesAtInit[ 0 ] );
			expect( renderCaptionAsHtml( slide.caption ).textContent ).toBe( 'The harbour’s best view' );
		} );

		it( 'keeps the rest of the slide intact', async () => {
			await renderSlideshows( [
				{
					src: 'https://example.com/1.jpg',
					caption: '<img src=x onerror=alert(1)>Spring',
					alt: 'Spring',
				},
			] );

			const [ slide ] = JSON.parse( galleriesAtInit[ 0 ] );
			expect( slide.src ).toBe( 'https://example.com/1.jpg' );
			expect( slide.alt ).toBe( 'Spring' );
			expect( renderCaptionAsHtml( slide.caption ).textContent ).toBe( 'Spring' );
		} );

		it( 'leaves no markup in a caption for the slideshow script to build elements from', async () => {
			await renderSlideshows( [
				{
					src: 'https://example.com/1.jpg',
					caption:
						'The harbour <img src="/missing" onerror="window.__captionHandlerFired = true;"> at dawn',
				},
			] );

			const [ slide ] = JSON.parse( galleriesAtInit[ 0 ] );
			const rendered = renderCaptionAsHtml( slide.caption );
			expect( rendered.querySelector( 'img' ) ).toBeNull();
			expect( rendered.innerHTML ).not.toContain( 'onerror' );
			expect( rendered.textContent ).toBe( 'The harbour  at dawn' );
			expect( window.__captionHandlerFired ).toBeUndefined();
		} );

		// Breakouts aimed at the caption sink, including the mutation-XSS shapes that survive a naive
		// tag strip by relying on the parser re-opening a tag the stripper thought it had closed.
		it.each( [
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
		] )( 'leaves no element behind when a caption carries %j', async ( caption ) => {
			await renderSlideshows( [ { src: 'https://example.com/1.jpg', caption } ] );

			const [ slide ] = JSON.parse( galleriesAtInit[ 0 ] );
			expect( renderCaptionAsHtml( slide.caption ).querySelectorAll( '*' ) ).toHaveLength( 0 );
		} );

		it.each( [
			[ 'an array', [ '<img src=x onerror=alert(1)>' ] ],
			[ 'a nested object', { toString: '<img src=x onerror=alert(1)>' } ],
			[ 'an array of arrays', [ [ '<img src=x onerror=alert(1)>' ] ] ],
		] )( 'leaves no element behind when a caption is %s', async ( _label, caption ) => {
			// innerHTML takes a string, so a non-string caption is coerced: an array of markup joins
			// back into the markup it holds and is parsed as HTML.
			await renderSlideshows( [ { src: 'https://example.com/1.jpg', caption } ] );

			const [ slide ] = JSON.parse( galleriesAtInit[ 0 ] );
			expect( renderCaptionAsHtml( slide.caption ).querySelectorAll( '*' ) ).toHaveLength( 0 );
			expect( slide.src ).toBe( 'https://example.com/1.jpg' );
		} );

		it( 'sanitizes every slideshow on the page, not only the one being processed', async () => {
			await renderSlideshows(
				[ { src: 'https://example.com/1.jpg', caption: 'A view of the harbour' } ],
				[
					{
						src: 'https://example.com/2.jpg',
						caption: '<img src="/missing" onerror="window.__captionHandlerFired = true;">',
					},
				]
			);

			expect( galleriesAtInit ).toHaveLength( 2 );
			galleriesAtInit.forEach( ( gallery ) => {
				JSON.parse( gallery ).forEach( ( slide ) => {
					expect( renderCaptionAsHtml( slide.caption ).querySelector( 'img' ) ).toBeNull();
				} );
			} );
		} );

		it( 'drops gallery data that is not a list of slides', async () => {
			renderContent( '<div class="jetpack-slideshow" data-gallery="not json"></div>' );
			await waitFor( () => expect( galleriesAtInit ).not.toBeNull() );

			expect( galleriesAtInit ).toEqual( [ null ] );
		} );

		it( 'drops a gallery payload that is an attribute breakout rather than JSON', async () => {
			renderContent(
				`<div class="jetpack-slideshow" data-gallery="${ ATTRIBUTE_BREAKOUT }"></div>`
			);
			await waitFor( () => expect( galleriesAtInit ).not.toBeNull() );

			expect( galleriesAtInit ).toEqual( [ null ] );
		} );
	} );
} );
