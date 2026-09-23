/**
 * @jest-environment jsdom
 */
/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["verifyClassification", "expect"] }] */

import detectMedia from 'calypso/lib/post-normalizer/rule-content-detect-media';
import makeContentLinksSafe from 'calypso/lib/post-normalizer/rule-content-make-links-safe';
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

	describe( 'content DOM rule order', () => {
		// Both invariants are invisible in the output once every rule validates its own URLs, so
		// assert the order itself rather than a behaviour that survives getting it wrong.
		test( 'strips event handlers before any rule snapshots markup into a post field', () => {
			expect( contentDomRules.indexOf( removeEventHandlers ) ).toBeLessThan(
				contentDomRules.indexOf( detectMedia )
			);
		} );

		test( 'checks links after every rule that builds one', () => {
			expect( contentDomRules.at( -1 ) ).toBe( makeContentLinksSafe );
		} );
	} );
} );
