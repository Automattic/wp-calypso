/**
 * @format
 * @jest-environment jsdom
 */
jest.mock( 'lib/safe-image-url', () => require( './mocks/lib/safe-image-url' ) );

import { trim } from 'lodash';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import linkJetpackCarousels from '../rule-content-link-jetpack-carousels';

jest.mock( 'lib/safe-image-url', () => require( './mocks/lib/safe-image-url' ) );

function identifyTransform( post, callback ) {
	callback();
}

function failIfCalledTransform() {
	expect( false ).toBeTruthy();
	// intentionally don't call callback
}

function asyncTransform( post, callback ) {
	process.nextTick( callback );
}

describe( 'index', () => {
	let normalizer, safeImageUrlFake, allTransforms;

	beforeAll( function() {
		normalizer = require( '../' );
		safeImageUrlFake = require( 'lib/safe-image-url' );
		allTransforms = [
			normalizer.decodeEntities,
			normalizer.stripHTML,
			normalizer.preventWidows,
			normalizer.makeSiteIDSafeForAPI,
			normalizer.pickPrimaryTag,
			normalizer.safeImageProperties( 200 ),
			normalizer.withContentDOM(),
			normalizer.withContentDOM( [
				normalizer.content.removeStyles,
				normalizer.content.sanitizeContent,
				normalizer.content.makeImagesSafe( 300 ),
				normalizer.content.makeEmbedsSafe,
				normalizer.content.detectMedia,
				normalizer.content.makeLinksSafe,
			] ),
			normalizer.createBetterExcerpt,
			normalizer.waitForImagesToLoad,
			normalizer.pickCanonicalImage,
			normalizer.keepValidImages( 1, 1 ),
		];
	} );

	test( 'should export a function', () => {
		expect( typeof normalizer ).toEqual( 'function' );
	} );

	test( 'should return null if passed null', done => {
		normalizer( null, null, function( err, post ) {
			expect( post ).toBe( null );
			done( err );
		} );
	} );

	test( 'should return a copy of what it was passed', done => {
		const post = {};
		normalizer( post, [ identifyTransform ], function( err, normalized ) {
			expect( normalized ).not.toBe( post );
			done( err );
		} );
	} );

	test( 'should leave an empty object alone', done => {
		const post = {};
		normalizer( post, allTransforms, function( err, normalized ) {
			expect( normalized ).toEqual( post );
			done( err );
		} );
	} );

	test( 'should support async transforms', done => {
		const post = {
			title: 'title',
		};
		normalizer( post, [ asyncTransform, asyncTransform ], function( err, normalized ) {
			expect( normalized ).toEqual( post );
			done( err );
		} );
	} );

	test( 'should pass along an error if a transform yields one', done => {
		function errorInTransform( post, callback ) {
			callback( new Error( ' oh no' ) );
		}

		normalizer( {}, [ errorInTransform, failIfCalledTransform ], function( err, normalized ) {
			expect( err ).toBeTruthy();
			expect( ! normalized ).toBeTruthy();
			done();
		} );
	} );

	test( 'should pass along an error if an async transform yields one', done => {
		function errorInTransform( post, callback ) {
			process.nextTick( function() {
				callback( new Error( ' oh no' ) );
			} );
		}

		normalizer( {}, [ errorInTransform, failIfCalledTransform ], function( err, normalized ) {
			expect( err ).toBeTruthy();
			expect( ! normalized ).toBeTruthy();
			done();
		} );
	} );

	test( 'can decode entities', done => {
		const post = {
			title: 'title <i>&amp; bar</i>',
			excerpt: 'excerpt &amp; bar',
			author: {
				name: 'author &amp; <b>bar</b>',
			},
		};

		normalizer( post, [ normalizer.decodeEntities ], function( err, normalized ) {
			expect( normalized ).toEqual( {
				title: 'title <i>& bar</i>',
				excerpt: 'excerpt & bar',
				author: {
					name: 'author & <b>bar</b>',
				},
			} );
			done( err );
		} );
	} );

	test( 'can prevent widows', done => {
		const post = {
			excerpt: 'this is a longer excerpt bar',
		};

		normalizer( post, [ normalizer.preventWidows ], function( err, normalized ) {
			expect( normalized ).toEqual( {
				excerpt: 'this is a longer excerpt\xA0bar',
			} );
			done( err );
		} );
	} );

	test( 'can prevent widows in empty strings', done => {
		const post = {
			excerpt: '   ',
		};

		normalizer( post, [ normalizer.preventWidows ], function( err, normalized ) {
			expect( normalized ).toEqual( {
				excerpt: '',
			} );
			done( err );
		} );
	} );

	test( 'can remove html tags', done => {
		const post = {
			title: 'title <b>bar</b>',
			excerpt: 'excerpt <b style="foo">bar</style>',
			author: {
				name: 'author <b>b<i>a</i>r</b>',
			},
		};

		normalizer( post, [ normalizer.stripHTML ], function( err, normalized ) {
			expect( normalized ).toEqual( {
				title: 'title bar',
				excerpt: 'excerpt bar',
				author: {
					name: 'author bar',
				},
			} );
			done( err );
		} );
	} );

	describe( 'makeSiteIDSafeForAPI', () => {
		test( 'can make siteIDs into strings', done => {
			normalizer(
				{
					site_id: 12345,
				},
				[ normalizer.makeSiteIDSafeForAPI ],
				function( err, normalized ) {
					expect( normalized.normalized_site_id ).toBe( '12345' );
					done( err );
				}
			);
		} );

		test( 'can normalized the site_id for the api by replacing :: with /', done => {
			normalizer(
				{
					site_id: 'foo::bar',
				},
				[ normalizer.makeSiteIDSafeForAPI ],
				function( err, normalized ) {
					expect( normalized.normalized_site_id ).toBe( 'foo/bar' );
					expect( normalized.site_id ).toBe( 'foo::bar' );
					done( err );
				}
			);
		} );
	} );

	describe( 'safeImageProperties', () => {
		test( 'can make image properties safe', done => {
			const post = {
				author: {
					avatar_URL: 'http://example.com/me.jpg',
				},
				featured_image: 'http://foo.bar/',
				featured_media: {
					uri: 'http://example.com/media.jpg',
					type: 'image',
				},
				post_thumbnail: {
					URL: 'http://example.com/thumb.jpg',
					height: 1000,
					width: 1000,
					mime_type: '',
				},
				attachments: {
					1234: {
						mime_type: 'image/png',
						URL: 'http://example.com/media.jpg',
					},
					3456: {
						mime_type: 'text/text',
						URL: 'http://example.com/media.jpg',
					},
				},
			};
			normalizer( post, [ normalizer.safeImageProperties( 200 ) ], function( err, normalized ) {
				expect( normalized.author.avatar_URL ).toBe(
					'http://example.com/me.jpg-SAFE?quality=80&strip=info&w=200'
				);
				expect( normalized.featured_image ).toBe(
					'http://foo.bar/-SAFE?quality=80&strip=info&w=200'
				);
				expect( normalized.post_thumbnail.URL ).toBe(
					'http://example.com/thumb.jpg-SAFE?quality=80&strip=info&w=200'
				);
				expect( normalized.featured_media.uri ).toBe(
					'http://example.com/media.jpg-SAFE?quality=80&strip=info&w=200'
				);
				expect( normalized.attachments[ '1234' ].URL ).toBe(
					'http://example.com/media.jpg-SAFE?quality=80&strip=info&w=200'
				);
				expect( normalized.attachments[ '3456' ].URL ).toBe( 'http://example.com/media.jpg' );
				done( err );
			} );
		} );

		test( 'will ignore featured_media that is not of type "image"', done => {
			const post = {
				featured_media: {
					uri: 'http://example.com/media.jpg',
				},
			};
			normalizer( post, [ normalizer.safeImageProperties( 200 ) ], function( err, normalized ) {
				expect( normalized.featured_media.uri ).toBe( 'http://example.com/media.jpg' );
				done( err );
			} );
		} );
	} );

	describe( 'pickPrimaryTag', () => {
		test( 'can pick the primary tag by taking the tag with the highest post_count as the primary', done => {
			const post = {
				tags: {
					first: {
						name: 'first',
						post_count: 2,
					},
					second: {
						name: 'second',
						post_count: 200,
					},
				},
			};

			normalizer( post, [ normalizer.pickPrimaryTag ], function( err, normalized ) {
				expect( normalized.primary_tag ).toEqual( post.tags.second );
				done( err );
			} );
		} );

		test( 'can pick the primary tag by taking the first tag as primary if there is a tie', done => {
			const post = {
				tags: {
					first: {
						name: 'first',
						post_count: 200,
					},
					second: {
						name: 'second',
						post_count: 200,
					},
				},
			};

			normalizer( post, [ normalizer.pickPrimaryTag ], function( err, normalized ) {
				expect( normalized.primary_tag ).toEqual( post.tags.first );
				done( err );
			} );
		} );
	} );

	describe( 'content.disableAutoPlayOnMediaShortcodes', () => {
		test( 'should strip autoplay attributes from video', done => {
			normalizer(
				{
					content: '<video autoplay="1"></video>',
				},
				[ normalizer.withContentDOM( [ normalizer.content.disableAutoPlayOnMedia ] ) ],
				function( err, normalized ) {
					expect( normalized ).toEqual( { content: '<video></video>' } );
					done( err );
				}
			);
		} );

		test( 'should strip autoplay attributes from audio', done => {
			normalizer(
				{
					content: '<audio autoplay="1"></audio>',
				},
				[ normalizer.withContentDOM( [ normalizer.content.disableAutoPlayOnMedia ] ) ],
				function( err, normalized ) {
					expect( normalized ).toEqual( { content: '<audio></audio>' } );
					done( err );
				}
			);
		} );
	} );

	describe( 'the content normalizer (withContentDOM)', () => {
		test( 'should not call nested transforms if content is blank', done => {
			const post = {
				content: '',
			};
			normalizer( post, [ normalizer.withContentDOM( [ failIfCalledTransform ] ) ], function(
				err,
				normalized
			) {
				expect( normalized ).toEqual( post );
				done( err );
			} );
		} );

		test( 'should provide a __contentDOM property to transforms and remove it after', done => {
			function detectTimeTransform( post, dom ) {
				expect( dom ).toBeTruthy();
				expect( dom.querySelectorAll ).toBeTruthy();
				expect( dom.querySelectorAll( 'time' ).length ).toEqual( 1 );
				return post;
			}
			normalizer(
				{
					content: '<time>now</time>',
				},
				[ normalizer.withContentDOM( [ detectTimeTransform ] ) ],
				function( err, normalized ) {
					expect( normalized ).toBeTruthy();
					done( err );
				}
			);
		} );
	} );

	describe( 'content.removeStyles ', () => {
		test( 'can strip style attributes and style elements', done => {
			normalizer(
				{
					content: '<style>.foo{}</style><div style="width: 100000px">some content</div>',
				},
				[ normalizer.withContentDOM( [ normalizer.content.removeStyles ] ) ],
				function( err, normalized ) {
					expect( normalized.content ).toEqual( '<div>some content</div>' );
					done( err );
				}
			);
		} );

		test( 'can strip align attributes from non images', done => {
			normalizer(
				{
					content: '<div align="left"><img align="right" />some content</div>',
				},
				[ normalizer.withContentDOM( [ normalizer.content.removeStyles ] ) ],
				function( err, normalized ) {
					expect( normalized.content ).toEqual( '<div><img align="right">some content</div>' );
					done( err );
				}
			);
		} );

		test( 'leaves galleries intact', done => {
			normalizer(
				{
					content:
						'<div class="gallery" style="width: 100000px"><style>.gallery{}</style><div style="width:100px">some content</div></div>', //eslint-disable-line max-len
				},
				[ normalizer.withContentDOM( [ normalizer.content.removeStyles ] ) ],
				function( err, normalized ) {
					expect( normalized.content ).toEqual(
						'<div class="gallery" style="width: 100000px">' +
							'<style>.gallery{}</style><div style="width:100px">some content</div></div>'
					);
					done( err );
				}
			);
		} );

		test( 'leaves twitter emdeds intact', done => {
			normalizer(
				{
					content:
						'<div class="embed-twitter"><blockquote class="twitter-tweet"><p lang="en" dir="ltr"></p></blockquote><script async="" src="//platform.twitter.com/widgets.js" charset="utf-8"></script></div>', //eslint-disable-line max-len
				},
				[ normalizer.withContentDOM( [ normalizer.content.removeStyles ] ) ],
				function( err, normalized ) {
					/** @format */
					expect( normalized.content ).toEqual(
						'<div class="embed-twitter"><blockquote class="twitter-tweet">' +
							'<p lang="en" dir="ltr"></p></blockquote>' +
							'<script async="" src="//platform.twitter.com/widgets.js" charset="utf-8"></script></div>'
					);
					done( err );
				}
			);
		} );

		test( 'leaves instagram emdeds intact', done => {
			normalizer(
				{
					content:
						'<blockquote class="instagram-media" style="background:#FFF;"><div style="padding:8px;"><p style="margin:8px 0 0 0;"> <a style="color:#000;"></a></p></div></blockquote>', //eslint-disable-line max-len
				},
				[ normalizer.withContentDOM( [ normalizer.content.removeStyles ] ) ],
				function( err, normalized ) {
					expect( normalized.content ).toEqual(
						'<blockquote class="instagram-media" style="background:#FFF;">' +
							'<div style="padding:8px;">' +
							'<p style="margin:8px 0 0 0;"> <a style="color:#000;"></a></p>' +
							'</div>' +
							'</blockquote>'
					);
					done( err );
				}
			);
		} );
	} );

	describe( 'makeLinksSafe', () => {
		test( 'can make links in the post safe', done => {
			normalizer(
				{ content: '', URL: 'javascript:foo' },
				[ normalizer.makeLinksSafe ],
				( err, normalized ) => {
					expect( normalized.URL ).toEqual( '' );
					done( err );
				}
			);
		} );
	} );

	describe( 'content.makeContentLinksSafe', () => {
		const badLinks = [
			'javascript:foo',
			'gopher:uminn.edu',
			'ftp://ftp.example.com',
			'telnet://localhost',
			'feed://example.com',
		];
		badLinks.forEach( badLink => {
			test( 'can remove javascript: links', done => {
				normalizer(
					{ content: '<a href="' + badLink + '">hi there</a>' },
					[ normalizer.withContentDOM( [ normalizer.content.makeContentLinksSafe ] ) ],
					( err, normalized ) => {
						expect( normalized.content ).toEqual( '<a>hi there</a>' );
						done( err );
					}
				);
			} );
		} );
	} );

	describe( 'content.makeImagesSafe', () => {
		test( 'can route all images through wp-safe-image if no size specified', done => {
			normalizer(
				{
					content:
						'<img src="http://example.com/example.jpg"><img src="http://example.com/example2.jpg">',
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeImagesSafe() ] ) ],
				function( err, normalized ) {
					expect( normalized.content ).toEqual(
						'<img src="http://example.com/example.jpg-SAFE"><img src="http://example.com/example2.jpg-SAFE">'
					);
					done( err );
				}
			);
		} );

		test( 'updates images with relative sources to use the post domain', done => {
			normalizer(
				{
					URL: 'http://example.wordpress.com/?post=123',
					content: '<img src="/example.jpg"><img src="example2.jpg">',
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeImagesSafe() ] ) ],
				function( err, normalized ) {
					expect( normalized.content ).toEqual(
						'<img src="http://example.wordpress.com/example.jpg-SAFE">' +
							'<img src="http://example.wordpress.com/example2.jpg-SAFE">'
					);
					done( err );
				}
			);
		} );

		test( 'handles relative images with dot segments', done => {
			normalizer(
				{
					URL: 'http://example.wordpress.com/2015/01/my-post/',
					content: '<img src="../../../example.jpg">',
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeImagesSafe() ] ) ],
				function( err, normalized ) {
					expect( normalized.content ).toEqual(
						'<img src="http://example.wordpress.com/example.jpg-SAFE">'
					);
					done( err );
				}
			);
		} );

		test( 'can route all images through photon if a size is specified', done => {
			normalizer(
				{
					content:
						'<img src="http://example.com/example.jpg"><img src="http://example.com/example2.jpg">',
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeImagesSafe( 400 ) ] ) ],
				function( err, normalized ) {
					expect( normalized.content ).toEqual(
						'<img src="http://example.com/example.jpg-SAFE?quality=80&amp;strip=info&amp;w=400">' +
							'<img src="http://example.com/example2.jpg-SAFE?quality=80&amp;strip=info&amp;w=400">'
					);
					done( err );
				}
			);
		} );

		test( 'can remove images that cannot be made safe', done => {
			safeImageUrlFake.setReturns( null );
			normalizer(
				{
					content: '<img width="700" height="700" src="http://example.com/example.jpg?nope">',
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeImagesSafe( 400 ) ] ) ],
				function( err, normalized ) {
					expect( normalized.content ).toEqual( '' );
					done( err );
				}
			);
			safeImageUrlFake.undoReturns();
		} );

		test( 'can allow images that cannot be made safe but are from secure hosts', done => {
			safeImageUrlFake.setReturns( null );
			normalizer(
				{
					content: '<img width="700" height="700" src="https://example.com/example.jpg?nope">',
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeImagesSafe( 400 ) ] ) ],
				function( err, normalized ) {
					expect( normalized.content ).toEqual(
						'<img width="700" height="700" src="https://example.com/example.jpg?nope">'
					);
					done( err );
				}
			);
			safeImageUrlFake.undoReturns();
		} );

		test( 'removes event handlers from content images', done => {
			normalizer(
				{
					content: '<img onload="hi" onerror="there" src="http://example.com/example.jpg">',
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeImagesSafe() ] ) ],
				function( err, normalized ) {
					expect( normalized.content ).toEqual( '<img src="http://example.com/example.jpg-SAFE">' );
					done( err );
				}
			);
		} );

		test( 'removes srcsets', done => {
			normalizer(
				{
					content:
						'<img src="http://example.com/example.jpg" srcset="http://example.com/example-100.jpg 100w, http://example.com/example-600.jpg 600w">', //eslint-disable-line max-len
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeImagesSafe() ] ) ],
				function( err, normalized ) {
					expect( normalized.content ).toEqual( '<img src="http://example.com/example.jpg-SAFE">' );
					done( err );
				}
			);
		} );

		test( 'removes invalid srcsets', done => {
			normalizer(
				{
					content:
						'<img src="http://example.com/example.jpg" srcset="http://example.com/example-100-and-a-half.jpg 100.5w, http://example.com/example-600.jpg 600w">', //eslint-disable-line max-len
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeImagesSafe() ] ) ],
				function( err, normalized ) {
					expect( normalized.content ).toEqual( '<img src="http://example.com/example.jpg-SAFE">' );
					done( err );
				}
			);
		} );
	} );

	describe( 'waitForImagesToLoad', () => {
		test.skip( 'should fire when all images have loaded or errored', function( done ) {
			// these need to be objects that mimic the Image object
			const completeImage = {
					complete: true,
					src: 'http://example.com/one',
				},
				loadingImage = {
					complete: false,
					src: 'http://example.com/two',
					load: function() {
						this.onload();
					},
				},
				erroringImage = {
					complete: false,
					src: 'http://example.com/three',
					error: function() {
						this.onerror();
					},
				};

			loadingImage.load = loadingImage.load.bind( loadingImage );
			erroringImage.error = erroringImage.error.bind( erroringImage );

			const post = {
				content_images: [ completeImage, loadingImage, erroringImage ],
			};

			setTimeout( loadingImage.load, 1 );
			setTimeout( erroringImage.error, 2 );

			normalizer.waitForImagesToLoad( post, done );
		} );

		test.skip( 'should dedupe the images to check', function( done ) {
			const first = {
					complete: true,
					src: 'http://example.com/one',
				},
				firstDupe = {
					complete: true,
					src: 'http://example.com/one',
				},
				second = {
					complete: true,
					src: 'http://example.com/three',
				},
				post = {
					content_images: [ first, second, firstDupe ],
				};

			normalizer( post, [ normalizer.waitForImagesToLoad ], function( err, normalized ) {
				expect( normalized.images.length ).toEqual( 2 );
				done( err );
			} );
		} );
	} );

	describe( 'canonical image picker', () => {
		test( 'can pick the canonical image from images', done => {
			const postRunThroughWaitForImagesToLoad = {
				content_images: [
					null, // null reference
					{
						height: 1,
						width: 1,
					}, // too small
					{
						height: 351,
						width: 5,
					}, // too narrow
					{
						height: 5,
						width: 351,
					}, // too short
					{
						height: 351,
						width: 351,
						src: 'http://example.com/image.jpg',
					}, // YES
					{
						height: 3500,
						width: 3500,
					}, // prefer first that passes
				],
			};

			normalizer( postRunThroughWaitForImagesToLoad, [ normalizer.pickCanonicalImage ], function(
				err,
				normalized
			) {
				expect( normalized.images ).toEqual( postRunThroughWaitForImagesToLoad.images );
				expect( normalized.canonical_image.uri ).toBe( 'http://example.com/image.jpg' );
				done( err );
			} );
		} );

		test( 'will pick featured_image if present and images missing', done => {
			normalizer(
				{
					post_thumbnail: {
						URL: 'http://example.com/featured.jpg',
						width: 700,
						height: 200,
					},
				},
				[ normalizer.pickCanonicalImage ],
				function( err, normalized ) {
					expect( normalized.canonical_image.uri ).toBe( 'http://example.com/featured.jpg' );
					done( err );
				}
			);
		} );

		test( 'will pick post_thumbnail over featured_image if present and images missing', done => {
			normalizer(
				{
					featured_image: 'http://example.com/featured.jpg',
					post_thumbnail: {
						URL: 'http://example.com/thumb.jpg',
						width: 1000,
						height: 1000,
						mime_type: '',
					},
					featured_media: {
						type: 'image',
						uri: 'http://example.com/media.jpg',
					},
				},
				[ normalizer.pickCanonicalImage ],
				function( err, normalized ) {
					expect( normalized.canonical_image.uri ).toBe( 'http://example.com/thumb.jpg' );
					done( err );
				}
			);
		} );
	} );

	describe( 'keepValidImages', () => {
		test( 'should filter post.images based on size', () => {
			function fakeImage( width, height ) {
				return {
					width: width,
					height: height,
				};
			}
			const post = {
					images: [ fakeImage( 5, 201 ), fakeImage( 101, 5 ), fakeImage( 100, 200 ) ],
					content_images: [
						fakeImage( 5, 201 ),
						fakeImage( 101, 5 ),
						fakeImage( 100, 200 ),
						fakeImage( 101, 201 ),
					],
				},
				callbackSpy = spy();

			normalizer.keepValidImages( 100, 200 )( post, callbackSpy );

			expect( callbackSpy.called ).toBe( true );

			expect( post.images.length ).toBe( 1 );
			expect( post.content_images.length ).toBe( 2 );
		} );
	} );

	describe( 'content.makeEmbedsSafe', () => {
		test( 'makes iframes safe, rewriting to ssl and sandboxing', done => {
			normalizer(
				{
					content: '<iframe src="http://example.com"></iframe>',
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeEmbedsSafe ] ) ],
				function( err, normalized ) {
					expect( normalized.content ).toBe(
						'<iframe src="https://example.com/" sandbox=""></iframe>'
					);
					done( err );
				}
			);
		} );

		test( 'allows trusted sources to be unsandboxed', done => {
			normalizer(
				{
					content: '<iframe src="http://spotify.com"></iframe>',
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeEmbedsSafe ] ) ],
				function( err, normalized ) {
					expect( normalized.content ).toBe( '<iframe src="https://spotify.com/"></iframe>' );
					done( err );
				}
			);
		} );

		test( 'applies the right level of sandboxing to whitelisted sources', done => {
			normalizer(
				{
					content: '<iframe src="http://youtube.com"></iframe>',
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeEmbedsSafe ] ) ],
				function( err, normalized ) {
					expect( normalized.content ).toBe(
						'<iframe src="https://youtube.com/" sandbox="allow-same-origin allow-scripts allow-popups"></iframe>'
					);
					done( err );
				}
			);
		} );

		test( 'removes iframes with an empty src', done => {
			normalizer(
				{
					content: '<iframe src=""></iframe>',
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeEmbedsSafe ] ) ],
				function( err, normalized ) {
					expect( normalized.content ).toBe( '' );
					done( err );
				}
			);
		} );

		test( 'removes objects from external posts', done => {
			normalizer(
				{
					is_external: true,
					content:
						'<object data="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="></object>',
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeEmbedsSafe ] ) ],
				function( err, normalized ) {
					expect( normalized.content ).toBe( '' );
					done( err );
				}
			);
		} );

		test( 'removes embeds from external posts', done => {
			normalizer(
				{
					is_external: true,
					content: '<embed src="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">',
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeEmbedsSafe ] ) ],
				function( err, normalized ) {
					expect( normalized.content ).toBe( '' );
					done( err );
				}
			);
		} );
	} );

	describe( 'content.detectMedia', () => {
		test( 'detects whitelisted iframes', done => {
			normalizer(
				{
					content: '<iframe width="100" height="50" src="https://youtube.com"></iframe>',
				},
				[ normalizer.withContentDOM( [ normalizer.content.detectMedia ] ) ],
				function( err, normalized ) {
					expect( normalized.content_embeds.length ).toBe( 1 );

					const embed = normalized.content_embeds[ 0 ];
					expect( embed.iframe ).toBe(
						'<iframe width="100" height="50" src="https://youtube.com"></iframe>'
					);
					expect( embed.height ).toBe( 50 );
					expect( embed.width ).toBe( 100 );
					expect( embed.type ).toBeNull();
					expect( embed.aspectRatio ).toBe( 2 );

					done( err );
				}
			);
		} );

		test( 'detects images intermixed with embeds and in the correct order', done => {
			normalizer(
				{
					content:
						'<img src="example1.png" /> <iframe src="https://vimeo.com/v/hi"></iframe> <img src="example2.png" />',
				},
				[ normalizer.withContentDOM( [ normalizer.content.detectMedia ] ) ],
				function( err, normalized ) {
					expect( normalized.content_media.length ).toBe( 3 );
					expect( normalized.content_images.length ).toBe( 2 );
					expect( normalized.content_embeds.length ).toBe( 1 );
					expect( normalized.content_media[ 0 ] ).toEqual( normalized.content_images[ 0 ] );
					expect( normalized.content_media[ 1 ] ).toEqual( normalized.content_embeds[ 0 ] );
					expect( normalized.content_media[ 2 ] ).toEqual( normalized.content_images[ 1 ] );
					done( err );
				}
			);
		} );

		test( 'detects images', done => {
			normalizer(
				{
					content: `<img src="example1.png" />
					<img src="/relativeurl.png" />
					<img src="https://google.com/images/absoluteurl.jpg"> text in the middle</img>`,
				},
				[ normalizer.withContentDOM( [ normalizer.content.detectMedia ] ) ],
				function( err, normalized ) {
					expect( normalized.content_media.length ).toBe( 3 );
					expect( normalized.content_images.length ).toBe( 3 );
					expect( normalized.content_embeds.length ).toBe( 0 );

					done( err );
				}
			);
		} );

		test( 'detects trusted iframes', done => {
			normalizer(
				{
					content: '<iframe width="100" height="50" src="https://embed.spotify.com"></iframe>',
				},
				[ normalizer.withContentDOM( [ normalizer.content.detectMedia ] ) ],
				function( err, normalized ) {
					expect( normalized.content_embeds.length ).toBe( 1 );

					const embed = normalized.content_embeds[ 0 ];
					expect( embed.iframe ).toBe(
						'<iframe width="100" height="50" src="https://embed.spotify.com"></iframe>'
					);
					done( err );
				}
			);
		} );
		test( 'detects youtube embed', done => {
			normalizer(
				{
					content:
						'<p><span class="embed-youtube">' +
						'<iframe src="https://YouTube.com"></iframe>' +
						'</span></p>',
				},
				[ normalizer.withContentDOM( [ normalizer.content.detectMedia ] ) ],
				function( err, normalized ) {
					expect( normalized.content_embeds[ 0 ].type ).toBe( 'youtube' );
					done( err );
				}
			);
		} );
		test( 'detects vimeo embed', done => {
			normalizer(
				{
					content:
						'<div class="embed-vimeo">' + '<iframe src="https://Vimeo.com"></iframe>' + '</div>',
				},
				[ normalizer.withContentDOM( [ normalizer.content.detectMedia ] ) ],
				function( err, normalized ) {
					expect( normalized.content_embeds[ 0 ].type ).toBe( 'vimeo' );
					done( err );
				}
			);
		} );
		test( 'empty content yields undefined', done => {
			normalizer(
				{
					content: '',
				},
				[ normalizer.withContentDOM( [ normalizer.content.detectMedia ] ) ],
				function( err, normalized ) {
					expect( normalized.content_embeds ).not.toBeDefined();
					done( err );
				}
			);
		} );
		test( 'content with no embeds yields an empty array', done => {
			normalizer(
				{
					content: '<p>foo</p>',
				},
				[ normalizer.withContentDOM( [ normalizer.content.detectMedia ] ) ],
				function( err, normalized ) {
					expect( normalized.content_embeds ).toEqual( [] );
					done( err );
				}
			);
		} );
		test( 'ignores embeds from non-whitelisted providers', done => {
			const badSrcs = [
				'http://example.com',
				'http://example.com?src=http://youtube.com',
				'http://example.com?src=http://YouTube.com',
				'http://foobar.youtube.com.example.com/',
				'http://foobaryoutube.com/',
				'https://notspotify.com/',
			];
			const badContent = badSrcs.map( src => '<iframe src="' + src + '"></iframe>' ).join( '\n' );
			normalizer(
				{
					content: badContent,
				},
				[ normalizer.withContentDOM( [ normalizer.content.detectMedia ] ) ],
				function( err, normalized ) {
					expect( normalized.content_embeds ).toEqual( [] );
					done( err );
				}
			);
		} );
		test( 'links to embedded Polldaddy polls', done => {
			normalizer(
				{
					content:
						'<a name="pd_a_8980420"></a>' +
						'<div class="PDS_Poll" id="PDI_container8980420" style="display:inline-block;"></div>' +
						'<div id="PD_superContainer"></div>' +
						'<script type="text/javascript" charset="UTF-8" src="//static.polldaddy.com/p/8980420.js"></script>' +
						'<noscript><a href="http://polldaddy.com/poll/8980420">Take Our Poll</a></noscript>',
				},
				[ normalizer.withContentDOM( [ normalizer.content.detectPolls ] ) ],
				function( err, normalized ) {
					expect( normalized.content ).toContain(
						//eslint-disable-line max-len
						'<p><a target="_blank" rel="external noopener noreferrer" href="https://polldaddy.com/poll/8980420">Take our poll</a></p>'
					);
					done( err );
				}
			);
		} );

		test( 'removes elements by selector', done => {
			normalizer(
				{
					content: `
					<div class="sharedaddy">sharedaddy</div>
					<script>/*hi*/</script>
					<div class="jp-relatedposts">jetpack</div>
					<div class="jp-relatedposts-headline">jetpack</div>
					<div class="mc4wp-form">a form</div>
					<div class="wpcnt">wordads</div>
					<div class="OUTBRAIN">outbrain content ads</div>
					<div class="adsbygoogle">google ads</div>
					<form><input type="text"></form>
					<input type="password">
					<select><option>nope</option></select>
					<button>hi</button>
					<textarea>noooope</textarea>
					`,
				},
				[ normalizer.withContentDOM( [ normalizer.content.removeElementsBySelector ] ) ],
				function( err, normalized ) {
					expect( trim( normalized.content ) ).toEqual( '' );
					done( err );
				}
			);
		} );
	} );

	describe( 'The fancy excerpt creator', () => {
		function assertExcerptBecomes( source, expected, done ) {
			normalizer( { content: source }, [ normalizer.createBetterExcerpt ], function(
				err,
				normalized
			) {
				expect( normalized.better_excerpt ).toBe( expected );
				done( err );
			} );
		}

		test( 'strips empty elements, leading brs, and styling attributes', done => {
			assertExcerptBecomes(
				`<br>
                <p>&nbsp;</p>
                <p class="wp-caption">caption</p>
                <p><img src="http://example.com/image.jpg"></p>
                <p align="left" style="text-align:right"><a href="http://wikipedia.org">Giraffes</a> are <br>great</p>
                <p></p>`,
				'<p>Giraffes are <br>great</p>',
				done
			);
		} );

		test( 'strips leading brs even if they are nested', done => {
			assertExcerptBecomes(
				'<p><br>deep meaning lies within</p>',
				'<p>deep meaning lies within</p>',
				done
			);
		} );

		test( 'strips multiple leading brs even if nested', done => {
			assertExcerptBecomes(
				'<p><br><br><br></p><br><p><br></p>deep meaning lies within',
				'deep meaning lies within',
				done
			);
		} );

		test( 'only trims break if there is no preceding text', done => {
			assertExcerptBecomes( '<p>one<br>two</p>', '<p>one<br>two</p>', done );
		} );

		test( 'limits the excerpt to 3 elements', done => {
			assertExcerptBecomes(
				'<p>one</p><p>two</p><p>three</p><p>four</p>',
				'<p>one</p><p>two</p><p>three</p>',
				done
			);
		} );

		test( 'limits the excerpt to 3 elements after trimming', done => {
			assertExcerptBecomes(
				'<br /><p></p><p>one</p><p>two</p><p></p><br><p>three</p><p>four</p><br><p></p>',
				'<p>one</p><p>two</p><br>',
				done
			);
		} );

		test( 'removes style tags', done => {
			assertExcerptBecomes(
				'<style>#foo{ color: blue; }</style><p>hi there</p>',
				'<p>hi there</p>',
				done
			);
		} );

		test( 'builds the content without html', done => {
			const source = '<style>#foo{ color: blue; }</style><p>hi there</p>';
			normalizer( { content: source }, [ normalizer.createBetterExcerpt ], function(
				err,
				normalized
			) {
				expect( normalized.content_no_html ).toBe( 'hi there' );
				done( err );
			} );
		} );
	} );

	describe( 'Jetpack Carousel Linker', () => {
		test( 'should fix links to jetpack carousels', done => {
			const source = `
				<div class="tiled-gallery"
					data-carousel-extra="{&quot;permalink&quot;:&quot;https:\\/\\/example.com\\/foo\\/&quot;}">
					<div class="gallery-row">
						<div class="gallery-group">
							<div class="tiled-gallery-item">
								<a href="https://example.com/foo/bar/">
									<img
										src="https://example.com/foo/bar/img/"
										data-attachment-id="500"
									/>
								</a>
							</div>
						</div>
					</div>
				</div>
			`;
			const expected = `
				<div class="tiled-gallery" data-carousel-extra="{&quot;permalink&quot;:&quot;https:\\/\\/example.com\\/foo\\/&quot;}">
					<div class="gallery-row">
						<div class="gallery-group">
							<div class="tiled-gallery-item">
								<a href="https://example.com/foo/#jp-carousel-500" target="_blank">
									<img src="https://example.com/foo/bar/img/" data-attachment-id="500">
								</a>
							</div>
						</div>
					</div>
				</div>
			`;
			normalizer(
				{ content: source },
				[ normalizer.withContentDOM( [ linkJetpackCarousels ] ) ],
				( err, normalized ) => {
					expect( normalized.content.trim() ).toEqual( expected.trim() );
					done( err );
				}
			);
		} );
	} );
} );
