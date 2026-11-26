/**
 * @vitest-environment jsdom
 */
/* eslint vitest/expect-expect: ["error", { "assertFunctionNames": ["verifyClassification", "expectNothingRuns", "expect"] }] */

import detectMedia from 'calypso/lib/post-normalizer/rule-content-detect-media';
import detectPolls from 'calypso/lib/post-normalizer/rule-content-detect-polls';
import makeContentLinksSafe from 'calypso/lib/post-normalizer/rule-content-make-links-safe';
import { removeNoscript } from 'calypso/lib/post-normalizer/rule-content-remove-elements-by-selector';
import removeEventHandlers from 'calypso/lib/post-normalizer/rule-content-remove-event-handlers';
import { domForHtml, isFeaturedImageInContent } from 'calypso/lib/post-normalizer/utils';
import { classifyPost, contentDomRules, runFastRules } from '..';
import DISPLAY_TYPES from '../../display-types';

function verifyClassification( post, displayTypes ) {
	classifyPost( post );
	displayTypes.forEach( ( displayType ) => {
		expect( post.display_type & displayType ).toEqual( displayType );
	} );
}

describe( 'normalization-rules', () => {
	describe( 'classifyPost', () => {
		test( 'should mark an empty post UNCLASSIFIED', () => {
			verifyClassification( {}, [ DISPLAY_TYPES.UNCLASSIFIED ] );
		} );

		test( 'should classify a GALLERY post', () => {
			verifyClassification(
				{
					images: [
						{ src: 'http://example.com/foo1.jpg', width: 800, height: 600 },
						{ src: 'http://example.com/foo2.jpg', width: 1024, height: 768 },
						{ src: 'http://example.com/foo3.jpg', width: 640, height: 480 },
						{ src: 'http://example.com/foo4.jpg', width: 1024, height: 768 },
						{ src: 'http://example.com/foo5.jpg', width: 1024, height: 768 },
					],
				},
				[ DISPLAY_TYPES.GALLERY ]
			);
		} );

		test( 'should classify as UNCLASSIFIED if the post has more than 1 image', () => {
			verifyClassification(
				{
					canonical_media: {
						mediaType: 'image',
						width: 1000,
					},
					content_images: [ { width: 1000 }, { width: 50 }, { width: 50 }, { width: 50 } ],
					better_excerpt_no_html: 'no '.repeat( 5 ),
				},
				[ DISPLAY_TYPES.UNCLASSIFIED ]
			);
		} );

		test( 'should classify a PHOTO_ONLY post', () => {
			verifyClassification(
				{
					content_images: [ { src: 'http://example.com/foo.jpg' } ],
					canonical_media: {
						mediaType: 'image',
						width: 1000,
					},
					better_excerpt_no_html: 'no '.repeat( 10 ),
				},
				[ DISPLAY_TYPES.PHOTO_ONLY ]
			);
		} );

		test( 'should not classify a PHOTO_ONLY post if the content is too long', () => {
			verifyClassification(
				{
					content_images: [ { src: 'http://example.com/foo.jpg' } ],
					canonical_media: {
						mediaType: 'image',
						width: 1000,
					},
					better_excerpt_no_html: 'no '.repeat( 100 ),
				},
				[ DISPLAY_TYPES.UNCLASSIFIED ]
			);
		} );

		test( 'should classify a FEATURED_VIDEO post', () => {
			verifyClassification( { canonical_media: { mediaType: 'video' } }, [
				DISPLAY_TYPES.FEATURED_VIDEO,
			] );
		} );

		test( 'should classify an X_POST post', () => {
			verifyClassification( { tags: { 'p2-xpost': true } }, [ DISPLAY_TYPES.X_POST ] );
		} );

		test( 'should not classify as GALLERY when post has a featured_image', () => {
			verifyClassification(
				{
					featured_image: 'http://example.com/featured.jpg',
					images: [
						{ src: 'http://example.com/foo1.jpg', width: 800, height: 600 },
						{ src: 'http://example.com/foo2.jpg', width: 1024, height: 768 },
						{ src: 'http://example.com/foo3.jpg', width: 640, height: 480 },
						{ src: 'http://example.com/foo4.jpg', width: 1024, height: 768 },
						{ src: 'http://example.com/foo5.jpg', width: 1024, height: 768 },
					],
				},
				[ DISPLAY_TYPES.UNCLASSIFIED ]
			);
		} );
	} );

	describe( 'isFeaturedImageInContent', () => {
		test( 'should say that a post has featured image in content if the featured image is in the content', () => {
			// post.images has the same src twice because that how our posts actually are.
			// featured_image is always first and then content_images follow
			const post = {
				post_thumbnail: {
					URL: 'http://example.com/foo/bar/ping.jpg?w=2',
				},
				images: [
					{
						src: 'http://example.com/foo/bar/ping.jpg?w=2',
					},
					{
						src: 'http://example.com/foo/bar/ping.jpg?w=20',
					},
				],
			};
			expect( isFeaturedImageInContent( post ) ).toEqual( 1 );
		} );

		test( 'should say that featured image is not in content if featured image is not in content', () => {
			const post = {
				post_thumbnail: {
					URL: 'http://example.com/foo/baz/ping.jpg?w=2',
				},
				images: [
					{
						src: 'http://example2.com/foo/bar/different.jpg?w=20',
					},
				],
			};
			expect( isFeaturedImageInContent( post ) ).toBeFalsy();
		} );
	} );

	describe( 'runFastRules', () => {
		test( 'strips event handlers before embeds are snapshotted', () => {
			const post = runFastRules( {
				content:
					'<iframe src="https://www.youtube.com/embed/abc" width="640" height="360" ' +
					'onload="alert(1)"></iframe>',
			} );
			const [ embed ] = post.content_embeds;

			expect( embed.iframe ).toEqual( expect.stringContaining( 'youtube.com/embed/abc' ) );
			expect( embed.iframe ).not.toEqual( expect.stringContaining( 'onload' ) );
			expect( embed.autoplayIframe ).toEqual( expect.stringContaining( 'autoplay=1' ) );
			expect( embed.autoplayIframe ).not.toEqual( expect.stringContaining( 'onload' ) );
		} );

		test( 'never lets a rule write a permalink that is not http(s) into an href', () => {
			// Two layers cover this, and the assertion holds if either one does: linkJetpackCarousels
			// skips a gallery whose permalink is not a web address, and makeContentLinksSafe runs
			// after every rule that builds a link.
			const post = runFastRules( {
				content:
					'<div class="tiled-gallery" data-carousel-extra="{&quot;permalink&quot;:&quot;javascript:alert(1)&quot;}">' +
					'<div class="tiled-gallery-item"><a href="https://example.com/foo/bar/">' +
					'<img src="https://example.com/foo/bar/img/" data-attachment-id="500" />' +
					'</a></div></div>',
			} );
			const dom = domForHtml( post.content );

			expect( dom.querySelector( '.tiled-gallery-item a' ) ).not.toBeNull();
			expect( dom.querySelector( '[href^="javascript:"]' ) ).toBeNull();
		} );

		test( 'strips a link that is not a web address from the rendered content', () => {
			const post = runFastRules( {
				content: '<a href="javascript:alert(1)">click</a>',
			} );

			expect( domForHtml( post.content ).querySelector( '[href^="javascript:"]' ) ).toBeNull();
		} );
	} );

	describe( 'the rendered content', () => {
		const SVG_NS = 'http://www.w3.org/2000/svg';
		const XLINK_NS = 'http://www.w3.org/1999/xlink';
		const webAddress = /^https?:\/\//;

		// What `ContentProcessor` does with `post.content`: a parse in the live document, where
		// scripting is on.
		function render( html ) {
			const container = document.createElement( 'div' );
			container.innerHTML = html;
			return container;
		}

		function navigationTargets( container ) {
			return Array.from( container.querySelectorAll( 'a, area' ) ).flatMap( ( link ) =>
				link.namespaceURI === SVG_NS
					? [ link.getAttribute( 'href' ), link.getAttributeNS( XLINK_NS, 'href' ) ]
					: [ link.getAttribute( 'href' ) ]
			);
		}

		function expectNothingRuns( content ) {
			const container = render( content );
			const elements = Array.from( container.querySelectorAll( '*' ) );

			expect(
				elements.flatMap( ( element ) =>
					element.getAttributeNames().filter( ( name ) => /^on/i.test( name ) )
				)
			).toStrictEqual( [] );
			expect(
				navigationTargets( container ).filter(
					( href ) => href !== null && ! webAddress.test( new URL( href, document.baseURI ).href )
				)
			).toStrictEqual( [] );
			expect(
				Array.from( container.querySelectorAll( 'animate, set' ) ).map( ( animation ) =>
					animation.getAttribute( 'attributeName' )
				)
			).toStrictEqual( [] );
			expect(
				elements.filter(
					( element ) => element.localName === 'iframe' && ! element.hasAttribute( 'sandbox' )
				)
			).toStrictEqual( [] );
			expect( container.querySelector( 'script, noscript, base, meta, link' ) ).toBeNull();
		}

		const carriers = [
			[
				'a comment inside noscript',
				'<p>a</p><noscript><!--</noscript><img src="https://example.com/x" onerror="alert(1)">--></noscript>',
			],
			[
				'xmp text inside noscript',
				'<p>a</p><noscript><xmp></noscript><img src="https://example.com/x" onerror="alert(1)"></xmp></noscript>',
			],
			[
				'an mglyph and xmp in MathML',
				'<math><mtext><table><mglyph><xmp><img src="https://example.com/x" onerror="alert(1)"></xmp></mglyph></table></mtext></math>',
			],
			[
				'a VideoPress embed marker inside inline SVG',
				'<svg><g class="wp-block-video wp-block-embed is-type-video is-provider-videopress">' +
					'<text class="wp-block-embed__wrapper">https://videopress.com/v/abc</text></g>' +
					'<xmp><img src="https://example.com/x" onerror="alert(1)"></xmp></svg>',
			],
			[
				'an image map area',
				'<map name="m"><area shape="default" href="javascript:alert(1)"></map>' +
					'<img usemap="#m" src="https://example.com/a.jpg">',
			],
			[
				'an SVG animation of a link',
				'<svg><a href="https://example.com/"><set attributeName="href" to="javascript:alert(1)"></set>' +
					'<text>click</text></a></svg>',
			],
			[
				'an SVG poll link inside noscript',
				'<p>a</p><noscript><svg><a href="https://poll.fm/123"></a></svg></noscript>',
			],
			[
				'elements that act on the page',
				'<p>a</p><base href="https://example.com/"><meta http-equiv="refresh" content="0;url=https://example.com/">' +
					'<link rel="stylesheet" href="https://example.com/style.css">',
			],
		];

		// Browsers parse a DOMParser document with scripting off, so `noscript` holds markup there
		// while the live document treats it as text. jsdom's DOMParser parses with scripting on, but
		// the rules' fallback, a `div` in a document of its own, parses the way a browser's DOMParser
		// does, so hide DOMParser to reproduce that difference.
		let domParser;

		beforeEach( () => {
			domParser = global.DOMParser;
			global.DOMParser = undefined;
		} );

		afterEach( () => {
			global.DOMParser = domParser;
		} );

		test.each( carriers )( 'runs nothing from %s', ( name, content ) => {
			expectNothingRuns( runFastRules( { content } ).content );
		} );

		test( 'keeps ordinary content as it was', () => {
			const content =
				'<p>Hello <a href="https://example.com/">there</a>, <strong>reader</strong>.</p>' +
				'<ul><li>one</li><li>two</li></ul>' +
				'<svg><a href="https://example.com/"><text>svg link</text></a></svg>';

			expect( runFastRules( { content } ).content ).toBe( content );
		} );
	} );

	describe( 'content DOM rule order', () => {
		// Both invariants are invisible in the output once every rule validates its own URLs, so
		// assert the order itself rather than a behaviour that survives getting it wrong.
		test( 'strips event handlers before any rule snapshots markup into a post field', () => {
			expect( contentDomRules.indexOf( removeEventHandlers ) ).toBeLessThan(
				contentDomRules.indexOf( detectMedia )
			);
		} );

		test( 'removes noscript elements only after the rules that read them', () => {
			const removal = contentDomRules.indexOf( removeNoscript );

			expect( contentDomRules.indexOf( detectMedia ) ).toBeLessThan( removal );
			expect( contentDomRules.indexOf( detectPolls ) ).toBeLessThan( removal );
		} );

		test( 'checks links after every rule that builds one', () => {
			expect( contentDomRules.at( -1 ) ).toBe( makeContentLinksSafe );
		} );
	} );
} );
