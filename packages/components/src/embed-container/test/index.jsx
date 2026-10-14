/**
 * @jest-environment jsdom
 */
/* eslint-disable react/no-danger -- the point of these tests is to feed the component raw post markup. */
import { render, waitFor } from '@testing-library/react';

jest.mock( '@automattic/load-script', () => ( {
	loadScript: jest.fn(),
	loadjQueryDependentScript: jest.fn(),
} ) );

const INSTAGRAM_SCRIPT = 'https://platform.instagram.com/en_US/embeds.js';
const INSTAGRAM_PERMALINK = 'https://www.instagram.com/p/BnMO9vRleEx/';
const JAVASCRIPT_URL = 'javascript:fetch( "/me" ).then( ( r ) => r.text() )//';

// An https URL that a provider interpolating it into an HTML string would let escape its attribute.
const QUOTED_URL = 'https://example.com/?a=1" onload="window.__xss = 1" x="';

const ATTRIBUTE_BREAKOUT = 'safe&quot; onload=&quot;window.__xss = 1&quot; x=&quot;';

let EmbedContainer;
let loadScript;
let loadjQueryDependentScript;

beforeEach( () => {
	// `loadAndRun` memoises provider scripts in a module-level cache, so without a fresh registry
	// only the first test to render a given embed sees its script load.
	jest.resetModules();
	EmbedContainer = require( '../' ).default;
	( { loadScript, loadjQueryDependentScript } = require( '@automattic/load-script' ) );
} );

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

describe( 'EmbedContainer', () => {
	describe( 'attributes a provider navigates to', () => {
		it( 'keeps a canonical Instagram permalink and hands the embed to the provider script', () => {
			const container = renderContent(
				`<blockquote class="instagram-media" data-instgrm-permalink="${ INSTAGRAM_PERMALINK }">post</blockquote>`
			);

			expect(
				container.querySelector( 'blockquote' ).getAttribute( 'data-instgrm-permalink' )
			).toBe( INSTAGRAM_PERMALINK );
			expect( loadedScripts() ).toContain( INSTAGRAM_SCRIPT );
		} );

		it( 'sanitizes before the provider script is requested', () => {
			let permalinkWhenScriptLoaded = 'not recorded';
			loadScript.mockImplementation( () => {
				permalinkWhenScriptLoaded = document
					.querySelector( '.instagram-media' )
					.getAttribute( 'data-instgrm-permalink' );
			} );

			renderContent(
				`<blockquote class="instagram-media" data-instgrm-permalink="${ JAVASCRIPT_URL }">post</blockquote>`
			);

			expect( permalinkWhenScriptLoaded ).toBeNull();
		} );

		it( 'keeps a legacy http permalink on the short domain', () => {
			const container = renderContent(
				'<blockquote class="instagram-media" data-instgrm-permalink="http://instagr.am/p/BnMO9vRleEx/">post</blockquote>'
			);

			expect(
				container.querySelector( 'blockquote' ).getAttribute( 'data-instgrm-permalink' )
			).toBe( 'http://instagr.am/p/BnMO9vRleEx/' );
		} );

		it.each( [
			JAVASCRIPT_URL,
			`  &#9;&#10;${ JAVASCRIPT_URL }`,
			'https://example.com/p/1/',
			'https://notinstagram.com/p/1/',
			'https://instagram.com.example.com/p/1/',
			'https://example.com/p/1/?utm=instagram.com',
			'https://cdninstagram.com/p/1/',
		] )( 'drops an Instagram permalink that is not one: %s', ( permalink ) => {
			const container = renderContent(
				`<blockquote class="instagram-media" data-instgrm-permalink="${ permalink }">post</blockquote>`
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
			[
				// Pinterest's pinit_main.js reads this off a document-level click handler and hands
				// it to window.open with no scheme check.
				'data-pin-href',
				'<a data-pin-do="embedPin" data-pin-href="%s"></a>',
				'https://www.pinterest.com/pin/1/',
			],
		] )( 'drops a javascript: %s but keeps an https one', ( attribute, markup, safeUrl ) => {
			const unsafe = renderContent( markup.replace( '%s', JAVASCRIPT_URL ) );
			expect( unsafe.querySelector( `[${ attribute }]` ) ).toBeNull();

			const safe = renderContent( markup.replace( '%s', safeUrl ) );
			expect( safe.querySelector( `[${ attribute }]` ).getAttribute( attribute ) ).toBe( safeUrl );
		} );

		it.each( [
			'https://user:pass@evil.example/widget',
			// The host a reader would read off this is not the one it reaches.
			'https://www.facebook.com@evil.example/widget',
		] )( 'drops a provider URL carrying credentials: %j', ( value ) => {
			const container = renderContent( `<div class="fb-post" data-href="${ value }"></div>` );

			expect( container.querySelector( '[data-href]' ) ).toBeNull();
		} );

		it.each( [ '', '   ', '/me/account', 'not-a-url', './relative', '#fragment' ] )(
			'drops a data-url that is not an absolute web URL: %j',
			( value ) => {
				// Resolving against the document URL would make each of these a wordpress.com page,
				// which a provider framing data-url would then load inside post content.
				const container = renderContent(
					`<div class="calendly-inline-widget" data-url="${ value }"></div>`
				);

				expect( container.querySelector( '[data-url]' ) ).toBeNull();
			}
		);

		it( 'keeps a protocol-relative provider URL', () => {
			const container = renderContent(
				'<div class="fb-post" data-href="//www.facebook.com/p/1"></div>'
			);

			expect( container.querySelector( '[data-href]' ).getAttribute( 'data-href' ) ).toBe(
				'//www.facebook.com/p/1'
			);
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

		it.each( [
			'javascript:alert(1)',
			'  JavaScript:alert(1)',
			'vbscript:msgbox(1)',
			// Tab, newline and carriage return are dropped from anywhere in a URL before the
			// scheme is read, so these all navigate as `javascript:`.
			'java&#9;script:alert(1)',
			'java&#10;script:alert(1)',
			'javascript&#13;:alert(1)',
			// Leading C0 controls are dropped too, and none of them is whitespace.
			'&#1;javascript:alert(1)',
			'&#14;javascript:alert(1)',
			// Inert here, but a provider interpolating it into markup gives the parser a second
			// pass at the entities, and `&colon;` becomes the `:` that makes it a scheme.
			'javascript&colon;alert(1)',
			'&#106;avascript&colon;alert(1)',
		] )( 'drops a data attribute carrying a script scheme: %j', ( value ) => {
			// Nothing here has a quote or an angle bracket, so only the scheme check catches it.
			const container = renderContent(
				`<div class="embed-reddit" data-embed-parent="${ value }"></div>`
			);

			expect( container.querySelector( '.embed-reddit' ).hasAttribute( 'data-embed-parent' ) ).toBe(
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

		it.each( [
			[
				'data-image-caption',
				'&lt;p&gt;She said &quot;hello&quot;&lt;/p&gt;',
				'<p>She said "hello"</p>',
			],
			[ 'data-orig-file', 'https://example.com/a.jpg', 'https://example.com/a.jpg' ],
			[
				'data-carousel-extra',
				'{&quot;permalink&quot;:&quot;https://example.com/p/&quot;}',
				'{"permalink":"https://example.com/p/"}',
			],
		] )( 'keeps %s, which we read ourselves', ( attribute, encoded, decoded ) => {
			const container = renderContent(
				`<div class="wp-block-gallery"><figure class="wp-block-image"><img src="https://example.com/a.jpg" ${ attribute }="${ encoded }" /></figure></div>`
			);

			expect( container.querySelector( 'img' ).getAttribute( attribute ) ).toBe( decoded );
		} );

		it( 'still drops a script scheme from an attribute we consume ourselves', () => {
			// The exemption covers the markup check only; the scheme check runs before it.
			const container = renderContent(
				'<figure class="wp-block-image"><img src="https://example.com/a.jpg" data-orig-file="javascript:alert(1)" /></figure>'
			);

			expect( container.querySelector( 'img' ).hasAttribute( 'data-orig-file' ) ).toBe( false );
		} );

		it( 'does not treat an inherited member name as a URL attribute', () => {
			// A null-prototype lookup table keeps `constructor` from resolving to Object and
			// sending an ordinary attribute down the URL path.
			const container = renderContent(
				'<div class="embed-issuu issuuembed" constructor="She said &quot;hello&quot;"></div>'
			);

			expect( container.querySelector( '.issuuembed' ).getAttribute( 'constructor' ) ).toBe(
				'She said "hello"'
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

		it( 'leaves data-gallery alone when it is a lightbox grouping key', () => {
			// Outside a Jetpack slideshow, data-gallery is the grouping convention lightbox
			// libraries use, not a JSON payload.
			const container = renderContent(
				'<figure class="wp-block-image"><a data-gallery="group-1" href="https://example.com/a.jpg"><img src="https://example.com/a.jpg" /></a></figure>'
			);

			expect( container.querySelector( '[data-gallery]' ).getAttribute( 'data-gallery' ) ).toBe(
				'group-1'
			);
		} );

		it( 'holds a grouping-key data-gallery to the same rules as any other data attribute', () => {
			const container = renderContent(
				`<figure class="wp-block-image"><a data-gallery="${ ATTRIBUTE_BREAKOUT }" href="https://example.com/a.jpg"><img src="https://example.com/a.jpg" /></a></figure>`
			);

			expect( container.querySelector( 'a' ).hasAttribute( 'data-gallery' ) ).toBe( false );
		} );
	} );

	describe( 'Jetpack slideshows', () => {
		// The gallery data of each slideshow as JetpackSlideshow sees it, read when the slideshow
		// script is told to initialize. That is the last moment at which sanitizing still helps.
		let galleriesAtInit;
		let triggerCount;

		const readGalleries = () =>
			Array.from( document.querySelectorAll( '.jetpack-slideshow' ) ).map( ( node ) =>
				node.getAttribute( 'data-gallery' )
			);

		beforeEach( () => {
			galleriesAtInit = null;
			triggerCount = 0;
			loadScript.mockImplementation( ( url, callback ) => callback() );
			loadjQueryDependentScript.mockImplementation( ( url, callback ) => callback() );

			const jQuery = jest.fn( () => ( {
				trigger: () => {
					triggerCount += 1;
					galleriesAtInit = readGalleries();
				},
			} ) );
			jQuery.prototype.cycle = () => {};
			window.jQuery = jQuery;
		} );

		afterEach( () => {
			delete window.jQuery;
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

		it( 'keeps comparison text that is not markup', async () => {
			// wp_strip_all_tags() leaves a `<` followed by whitespace in place, and so does the
			// HTML parser: neither can open an element.
			await renderSlideshows( [
				{
					src: 'https://example.com/1.jpg',
					caption: 'Temperatures < 0 degrees, wind > 30kph',
				},
			] );

			const [ slide ] = JSON.parse( galleriesAtInit[ 0 ] );
			expect( renderCaptionAsHtml( slide.caption ).textContent ).toBe(
				'Temperatures < 0 degrees, wind > 30kph'
			);
		} );

		it( 'keeps the rest of the slide intact', async () => {
			await renderSlideshows( [
				{
					src: 'https://example.com/1.jpg',
					caption: '<img src=x onerror=alert(1)>Spring',
					alt: 'Spring',
					id: 42,
					itemprop: 'image',
				},
			] );

			const [ slide ] = JSON.parse( galleriesAtInit[ 0 ] );
			expect( slide ).toEqual( {
				src: 'https://example.com/1.jpg',
				caption: 'Spring',
				alt: 'Spring',
				id: 42,
				itemprop: 'image',
			} );
		} );

		it( 'normalizes a caption-less slide to an empty caption', async () => {
			// The shortcode script assigns the caption unguarded, so a missing key renders the
			// literal string "undefined".
			await renderSlideshows( [ { src: 'https://example.com/1.jpg' } ] );

			const [ slide ] = JSON.parse( galleriesAtInit[ 0 ] );
			expect( slide ).toEqual( { src: 'https://example.com/1.jpg', caption: '' } );
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
			// The parser drops an unterminated tag at the end of input, so also pin that the
			// caption comes back encoded rather than merely element-free.
			expect( slide.caption ).not.toContain( '<' );
			expect( renderCaptionAsHtml( slide.caption ).querySelectorAll( '*' ) ).toHaveLength( 0 );
		} );

		it.each( [
			[ 'an array', [ '<img src=x onerror=alert(1)>' ] ],
			[ 'a nested object', { toString: '<img src=x onerror=alert(1)>' } ],
			[ 'an array of arrays', [ [ '<img src=x onerror=alert(1)>' ] ] ],
			[ 'null', null ],
		] )( 'leaves no element behind when a caption is %s', async ( _label, caption ) => {
			// innerHTML takes a string, so a non-string caption is coerced: an array of markup joins
			// back into the markup it holds and is parsed as HTML.
			await renderSlideshows( [ { src: 'https://example.com/1.jpg', caption } ] );

			const [ slide ] = JSON.parse( galleriesAtInit[ 0 ] );
			expect( slide.caption ).toBe( '' );
			expect( slide.src ).toBe( 'https://example.com/1.jpg' );
		} );

		it( 'sanitizes slideshows outside any EmbedContainer, since the script initializes them too', async () => {
			const loose = document.createElement( 'div' );
			loose.innerHTML = slideshowMarkup( [
				{ src: 'https://example.com/2.jpg', caption: '<img src=x onerror=alert(1)>' },
			] );
			document.body.appendChild( loose );

			await renderSlideshows( [
				{ src: 'https://example.com/1.jpg', caption: 'A view of the harbour' },
			] );

			expect( galleriesAtInit ).toHaveLength( 2 );
			galleriesAtInit.forEach( ( gallery ) => {
				JSON.parse( gallery ).forEach( ( slide ) => {
					expect( renderCaptionAsHtml( slide.caption ).querySelectorAll( '*' ) ).toHaveLength( 0 );
				} );
			} );

			loose.remove();
		} );

		it( 'rewrites a caption to the same value on every later pass', async () => {
			// The pass re-runs over every slideshow each time a slideshow initializes, so an encoder
			// that skipped the decode would turn `&amp;` into `&amp;amp;` a little more each time.
			await renderSlideshows( [
				{ src: 'https://example.com/1.jpg', caption: 'Bread &amp; butter' },
			] );

			const afterFirstPass = galleriesAtInit[ 0 ];

			renderContent( slideshowMarkup( [ { src: 'https://example.com/2.jpg', caption: 'x' } ] ) );
			await waitFor( () => expect( triggerCount ).toBeGreaterThan( 1 ) );

			expect( readGalleries()[ 0 ] ).toBe( afterFirstPass );
			expect( renderCaptionAsHtml( JSON.parse( afterFirstPass )[ 0 ].caption ).textContent ).toBe(
				'Bread & butter'
			);
		} );

		it.each( [
			[ 'is not JSON', 'not json' ],
			[ 'is an attribute breakout', ATTRIBUTE_BREAKOUT ],
			[ 'is not a list of slides', '{&quot;src&quot;:&quot;https://example.com/1.jpg&quot;}' ],
		] )( 'drops gallery data that %s', async ( _label, gallery ) => {
			renderContent( `<div class="jetpack-slideshow" data-gallery="${ gallery }"></div>` );
			await waitFor( () => expect( galleriesAtInit ).not.toBeNull() );

			expect( galleriesAtInit ).toEqual( [ null ] );
			// An empty gallery is a spinner JetpackSlideshow never clears, so keep it out of the way.
			expect( document.querySelector( '.jetpack-slideshow' ).dataset.processed ).toBe( 'true' );
		} );

		it( 'keeps sweeping when unusable gallery data sits on a foreign-namespace element', async () => {
			// `dataset` only exists on HTML and SVG elements, so marking this one as processed
			// through it would throw and leave everything after it unsanitized.
			renderContent(
				'<math class="jetpack-slideshow" data-gallery="{"></math>',
				slideshowMarkup( [
					{ src: 'https://example.com/1.jpg', caption: '<img src=x onerror=alert(1)>' },
				] )
			);
			await waitFor( () => expect( galleriesAtInit ).not.toBeNull() );

			expect( galleriesAtInit[ 0 ] ).toBeNull();
			expect(
				renderCaptionAsHtml( JSON.parse( galleriesAtInit[ 1 ] )[ 0 ].caption ).querySelector(
					'img'
				)
			).toBeNull();
		} );

		it( 'neutralizes gallery data too deep for JSON.stringify to return', async () => {
			// V8 parses JSON iteratively but serializes recursively, so a list nested a few thousand
			// deep round-trips through the parser and would overflow the stack on the way out.
			// Flattening each slide to primitives happens first, so the payload that reaches
			// JSON.stringify is never more than a few levels deep. A RangeError escaping here would
			// skip the trigger below and take every other slideshow in the stream down with it.
			const depth = 20000;
			const deep = '['.repeat( depth ) + ']'.repeat( depth );

			renderContent(
				`<div class="jetpack-slideshow" data-gallery="${ deep }"></div>`,
				slideshowMarkup( [ { src: 'https://example.com/1.jpg', caption: 'A harbour' } ] )
			);
			await waitFor( () => expect( galleriesAtInit ).not.toBeNull() );

			expect( JSON.parse( galleriesAtInit[ 0 ] ) ).toEqual( [ { caption: '' } ] );
			// The slideshow after it still got sanitized, and the trigger still ran.
			expect( JSON.parse( galleriesAtInit[ 1 ] )[ 0 ].caption ).toBe( 'A harbour' );
		} );
	} );
} );
