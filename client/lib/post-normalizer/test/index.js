/**
 * External dependencies
 */
const assert = require( 'chai' ).assert,
	Spy = require( 'sinon' ).spy,
	trim = require( 'lodash/trim' );

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useFilesystemMocks from 'test/helpers/use-filesystem-mocks';

function identifyTransform( post, callback ) {
	callback();
}

function failIfCalledTransform( /* post, callback */ ) {
	assert( false, 'should not have been called' );
	// intentionally don't call callback
}

function asyncTransform( post, callback ) {
	process.nextTick( callback );
}

describe( 'index', function() {
	let normalizer, safeImageUrlFake, allTransforms;

	useFakeDom();
	useFilesystemMocks( __dirname );

	before( function() {
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
			] ),
			normalizer.createBetterExcerpt,
			normalizer.waitForImagesToLoad,
			normalizer.pickCanonicalImage,
			normalizer.keepValidImages( 1, 1 )
		];
	} );

	it( 'should export a function', function() {
		assert.equal( typeof normalizer, 'function' );
	} );

	it( 'should return null if passed null', function( done ) {
		normalizer( null, null, function( err, post ) {
			assert.strictEqual( post, null );
			done( err );
		} );
	} );

	it( 'should return a copy of what it was passed', function( done ) {
		const post = {};
		normalizer( post, [ identifyTransform ], function( err, normalized ) {
			assert.notStrictEqual( normalized, post );
			done( err );
		} );
	} );

	it( 'should leave an empty object alone', function( done ) {
		const post = {};
		normalizer( post, allTransforms, function( err, normalized ) {
			assert.deepEqual( normalized, post );
			done( err );
		} );
	} );

	it( 'should support async transforms', function( done ) {
		const post = {
			title: 'title'
		};
		normalizer( post, [ asyncTransform, asyncTransform ], function( err, normalized ) {
			assert.deepEqual( normalized, post );
			done( err );
		} );
	} );

	it( 'should pass along an error if a transform yields one', function( done ) {
		function errorInTransform( post, callback ) {
			callback( new Error( ' oh no' ) );
		}

		normalizer( {}, [ errorInTransform, failIfCalledTransform ], function( err, normalized ) {
			assert( err, 'error should have been supplied' );
			assert( ! normalized, 'no normalized post should have been provided' );
			done();
		} );
	} );

	it( 'should pass along an error if an async transform yields one', function( done ) {
		function errorInTransform( post, callback ) {
			process.nextTick( function() {
				callback( new Error( ' oh no' ) );
			} );
		}

		normalizer( {}, [ errorInTransform, failIfCalledTransform ], function( err, normalized ) {
			assert( err, 'error should have been supplied' );
			assert( ! normalized, 'no normalized post should have been provided' );
			done();
		} );
	} );

	it( 'can decode entities', function( done ) {
		const post = {
			title: 'title <i>&amp; bar</i>',
			excerpt: 'excerpt &amp; bar',
			author: {
				name: 'author &amp; <b>bar</b>'
			}
		};

		normalizer( post, [ normalizer.decodeEntities ], function( err, normalized ) {
			assert.deepEqual( normalized, {
				title: 'title <i>& bar</i>',
				excerpt: 'excerpt & bar',
				author: {
					name: 'author & <b>bar</b>'
				}
			} );
			done( err );
		} );
	} );

	it( 'can prevent widows', function( done ) {
		const post = {
			excerpt: 'this is a longer excerpt bar'
		};

		normalizer( post, [ normalizer.preventWidows ], function( err, normalized ) {
			assert.deepEqual( normalized, {
				excerpt: 'this is a longer excerpt\xA0bar'
			} );
			done( err );
		} );
	} );

	it( 'can prevent widows in empty strings', function( done ) {
		const post = {
			excerpt: '   '
		};

		normalizer( post, [ normalizer.preventWidows ], function( err, normalized ) {
			assert.deepEqual( normalized, {
				excerpt: ''
			} );
			done( err );
		} );
	} );

	it( 'can remove html tags', function( done ) {
		const post = {
			title: 'title <b>bar</b>',
			excerpt: 'excerpt <b style="foo">bar</style>',
			author: {
				name: 'author <b>b<i>a</i>r</b>'
			}
		};

		normalizer( post, [ normalizer.stripHTML ], function( err, normalized ) {
			assert.deepEqual( normalized, {
				title: 'title bar',
				excerpt: 'excerpt bar',
				author: {
					name: 'author bar'
				}
			} );
			done( err );
		} );
	} );

	describe( 'makeSiteIDSafeForAPI', function() {
		it( 'can make siteIDs into strings', function( done ) {
			normalizer( {
				site_id: 12345
			}, [ normalizer.makeSiteIDSafeForAPI ], function( err, normalized ) {
				assert.strictEqual( normalized.normalized_site_id, '12345' );
				done( err );
			} );
		} );

		it( 'can normalized the site_id for the api by replacing :: with /', function( done ) {
			normalizer( {
				site_id: 'foo::bar'
			}, [ normalizer.makeSiteIDSafeForAPI ], function( err, normalized ) {
				assert.strictEqual( normalized.normalized_site_id, 'foo/bar' );
				assert.strictEqual( normalized.site_id, 'foo::bar' );
				done( err );
			} );
		} );
	} );

	describe( 'safeImageProperties', function() {
		it( 'can make image properties safe', function( done ) {
			const post = {
				author: {
					avatar_URL: 'http://example.com/me.jpg'
				},
				featured_image: 'http://foo.bar/',
				featured_media: {
					uri: 'http://example.com/media.jpg',
					type: 'image'
				},
				post_thumbnail: {
					URL: 'http://example.com/thumb.jpg',
					height: 1000,
					width: 1000,
					mime_type: ''
				},
				attachments: {
					1234: {
						mime_type: 'image/png',
						URL: 'http://example.com/media.jpg'
					},
					3456: {
						mime_type: 'text/text',
						URL: 'http://example.com/media.jpg'
					}
				}
			};
			normalizer( post, [ normalizer.safeImageProperties( 200 ) ], function( err, normalized ) {
				assert.strictEqual( normalized.author.avatar_URL, 'http://example.com/me.jpg-SAFE?quality=80&strip=info&w=200' );
				assert.strictEqual( normalized.featured_image, 'http://foo.bar/-SAFE?quality=80&strip=info&w=200' );
				assert.strictEqual( normalized.post_thumbnail.URL, 'http://example.com/thumb.jpg-SAFE?quality=80&strip=info&w=200' );
				assert.strictEqual( normalized.featured_media.uri, 'http://example.com/media.jpg-SAFE?quality=80&strip=info&w=200' );
				assert.strictEqual( normalized.attachments[ '1234' ].URL, 'http://example.com/media.jpg-SAFE?quality=80&strip=info&w=200' );
				assert.strictEqual( normalized.attachments[ '3456' ].URL, 'http://example.com/media.jpg' );
				done( err );
			} );
		} );

		it( 'will ignore featured_media that is not of type "image"', function( done ) {
			const post = {
				featured_media: {
					uri: 'http://example.com/media.jpg'
				}
			};
			normalizer( post, [ normalizer.safeImageProperties( 200 ) ], function( err, normalized ) {
				assert.strictEqual( normalized.featured_media.uri, 'http://example.com/media.jpg' );
				done( err );
			} );
		} );
	} );

	describe( 'pickPrimaryTag', function() {
		it( 'can pick the primary tag by taking the tag with the highest post_count as the primary', function( done ) {
			const post = {
				tags: {
					first: {
						name: 'first',
						post_count: 2
					},
					second: {
						name: 'second',
						post_count: 200
					}
				}
			};

			normalizer( post, [ normalizer.pickPrimaryTag ], function( err, normalized ) {
				assert.deepEqual( normalized.primary_tag, post.tags.second );
				done( err );
			} );
		} );

		it( 'can pick the primary tag by taking the first tag as primary if there is a tie', function( done ) {
			const post = {
				tags: {
					first: {
						name: 'first',
						post_count: 200
					},
					second: {
						name: 'second',
						post_count: 200
					}
				}
			};

			normalizer( post, [ normalizer.pickPrimaryTag ], function( err, normalized ) {
				assert.deepEqual( normalized.primary_tag, post.tags.first );
				done( err );
			} );
		} );
	} );

	describe( 'content.disableAutoPlayOnMediaShortcodes', function() {
		it( 'should strip autoplay attributes from video', function( done ) {
			normalizer(
				{
					content: '<video autoplay="1"></video>'
				},
				[ normalizer.withContentDOM( [ normalizer.content.disableAutoPlayOnMedia ] ) ],
				function( err, normalized ) {
					assert.deepEqual( normalized, { content: '<video></video>' } );
					done( err );
				}
			);
		} );

		it( 'should strip autoplay attributes from audio', function( done ) {
			normalizer(
				{
					content: '<audio autoplay="1"></audio>'
				},
				[ normalizer.withContentDOM( [ normalizer.content.disableAutoPlayOnMedia ] ) ],
				function( err, normalized ) {
					assert.deepEqual( normalized, { content: '<audio></audio>' } );
					done( err );
				}
			);
		} );
	} );

	describe( 'the content normalizer (withContentDOM)', function() {
		it( 'should not call nested transforms if content is blank', function( done ) {
			const post = {
				content: ''
			};
			normalizer(
				post,
				[ normalizer.withContentDOM( [ failIfCalledTransform ] ) ], function( err, normalized ) {
					assert.deepEqual( normalized, post );
					done( err );
				}
			);
		} );

		it( 'should provide a __contentDOM property to transforms and remove it after', function( done ) {
			function detectTimeTransform( post, dom ) {
				assert.ok( dom );
				assert.ok( dom.querySelectorAll );
				assert.equal( dom.querySelectorAll( 'time' ).length, 1 );
				return post;
			}
			normalizer(
				{
					content: '<time>now</time>'
				},
				[ normalizer.withContentDOM( [ detectTimeTransform ] ) ], function( err, normalized ) {
					assert.ok( normalized );
					done( err );
				}
			);
		} );
	} );

	describe( 'content.removeStyles ', function() {
		it( 'can strip style attributes and style elements', function( done ) {
			normalizer(
				{
					content: '<style>.foo{}</style><div style="width: 100000px">some content</div>'
				},
				[ normalizer.withContentDOM( [ normalizer.content.removeStyles ] ) ], function( err, normalized ) {
					assert.equal( normalized.content, '<div>some content</div>' );
					done( err );
				}
			);
		} );

		it( 'leaves galleries intact', function( done ) {
			normalizer(
				{
					content: '<style>.gallery{}</style><div class="gallery" style="width: 100000px"><div style="width:100px">some content</div></div>'
				},
				[ normalizer.withContentDOM( [ normalizer.content.removeStyles ] ) ], function( err, normalized ) {
					assert.equal( normalized.content, '<style>.gallery{}</style><div class="gallery" style="width: 100000px"><div style="width:100px">some content</div></div>' );
					done( err );
				}
			);
		} );
	} );

	describe( 'content.makeImagesSafe', function() {
		it( 'can route all images through wp-safe-image if no size specified', function( done ) {
			normalizer(
				{
					content: '<img src="http://example.com/example.jpg"><img src="http://example.com/example2.jpg">'
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeImagesSafe() ] ) ], function( err, normalized ) {
					assert.equal( normalized.content, '<img src="http://example.com/example.jpg-SAFE"><img src="http://example.com/example2.jpg-SAFE">' );
					done( err );
				}
			);
		} );

		it( 'updates images with relative sources to use the post domain', function( done ) {
			normalizer(
				{
					URL: 'http://example.wordpress.com/?post=123',
					content: '<img src="/example.jpg"><img src="example2.jpg">'
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeImagesSafe() ] ) ], function( err, normalized ) {
					assert.equal( normalized.content, '<img src="http://example.wordpress.com/example.jpg-SAFE"><img src="http://example.wordpress.com/example2.jpg-SAFE">' );
					done( err );
				}
			);
		} );

		it( 'handles relative images with dot segments', function( done ) {
			normalizer(
				{
					URL: 'http://example.wordpress.com/2015/01/my-post/',
					content: '<img src="../../../example.jpg">'
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeImagesSafe() ] ) ], function( err, normalized ) {
					assert.equal( normalized.content, '<img src="http://example.wordpress.com/example.jpg-SAFE">' );
					done( err );
				}
			);
		} );

		it( 'can route all images through photon if a size is specified', function( done ) {
			normalizer(
				{
					content: '<img src="http://example.com/example.jpg"><img src="http://example.com/example2.jpg">'
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeImagesSafe( 400 ) ] ) ], function( err, normalized ) {
					assert.equal( normalized.content, '<img src="http://example.com/example.jpg-SAFE?quality=80&amp;strip=info&amp;w=400"><img src="http://example.com/example2.jpg-SAFE?quality=80&amp;strip=info&amp;w=400">' );
					done( err );
				}
			);
		} );

		it( 'can remove images that cannot be made safe', function( done ) {
			safeImageUrlFake.setReturns( null );
			normalizer(
				{
					content: '<img width="700" height="700" src="http://example.com/example.jpg?nope">'
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeImagesSafe( 400 ) ] ) ], function( err, normalized ) {
					assert.equal( normalized.content, '' );
					done( err );
				}
			);
			safeImageUrlFake.undoReturns();
		} );

		it( 'removes event handlers from content images', function( done ) {
			normalizer(
				{
					content: '<img onload="hi" onerror="there" src="http://example.com/example.jpg">'
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeImagesSafe() ] ) ], function( err, normalized ) {
					assert.equal( normalized.content, '<img src="http://example.com/example.jpg-SAFE">' );
					done( err );
				}
			);
		} );

		it( 'removes srcsets', function( done ) {
			normalizer(
				{
					content: '<img src="http://example.com/example.jpg" srcset="http://example.com/example-100.jpg 100w, http://example.com/example-600.jpg 600w">'
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeImagesSafe() ] ) ], function( err, normalized ) {
					assert.equal( normalized.content, '<img src="http://example.com/example.jpg-SAFE">' );
					done( err );
				}
			);
		} );

		it( 'removes invalid srcsets', function( done ) {
			normalizer(
				{
					content: '<img src="http://example.com/example.jpg" srcset="http://example.com/example-100-and-a-half.jpg 100.5w, http://example.com/example-600.jpg 600w">'
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeImagesSafe() ] ) ], function( err, normalized ) {
					assert.equal( normalized.content, '<img src="http://example.com/example.jpg-SAFE">' );
					done( err );
				}
			);
		} );
	} );

	describe( 'waitForImagesToLoad', function() {
		it.skip( 'should fire when all images have loaded or errored', function( done ) {
			// these need to be objects that mimic the Image object
			let completeImage = {
					complete: true,
					src: 'http://example.com/one'
				},
				loadingImage = {
					complete: false,
					src: 'http://example.com/two',
					load: function() {
						this.onload();
					}
				},
				erroringImage = {
					complete: false,
					src: 'http://example.com/three',
					error: function() {
						this.onerror();
					}
				},
				post;

			loadingImage.load = loadingImage.load.bind( loadingImage );
			erroringImage.error = erroringImage.error.bind( erroringImage );

			post = {
				content_images: [
					completeImage, loadingImage, erroringImage
				]
			};

			setTimeout( loadingImage.load, 1 );
			setTimeout( erroringImage.error, 2 );

			normalizer.waitForImagesToLoad( post, done );
		} );

		it.skip( 'should dedupe the images to check', function( done ) {
			let first = {
					complete: true,
					src: 'http://example.com/one'
				},
				firstDupe = {
					complete: true,
					src: 'http://example.com/one'
				},
				second = {
					complete: true,
					src: 'http://example.com/three'
				},
				post = {
					content_images: [
						first, second, firstDupe
					]
				};

			normalizer(
				post,
				[ normalizer.waitForImagesToLoad ], function( err, normalized ) {
					assert.equal( normalized.images.length, 2 );
					done( err );
				} );
		} );
	} );

	describe( 'canonical image picker', function() {
		it( 'can pick the canonical image from images', function( done ) {
			const postRunThroughWaitForImagesToLoad = {
				content_images: [
					null, // null reference
					{
						height: 1,
						width: 1
					}, // too small
					{
						height: 351,
						width: 5
					}, // too narrow
					{
						height: 5,
						width: 351
					}, // too short
					{
						height: 351,
						width: 351,
						src: 'http://example.com/image.jpg'
					}, // YES
					{
						height: 3500,
						width: 3500
					} // prefer first that passes
				]
			};

			normalizer(
				postRunThroughWaitForImagesToLoad,
				[ normalizer.pickCanonicalImage ], function( err, normalized ) {
					assert.deepEqual( normalized.images, postRunThroughWaitForImagesToLoad.images );
					assert.strictEqual( normalized.canonical_image.uri, 'http://example.com/image.jpg' );
					done( err );
				}
			);
		} );

		it( 'will pick featured_image if present and images missing', function( done ) {
			normalizer(
				{
					featured_image: 'http://example.com/featured.jpg',
					featured_media: {
						type: 'image',
						uri: 'http://example.com/media.jpg'
					}
				},
				[ normalizer.pickCanonicalImage ], function( err, normalized ) {
					assert.strictEqual( normalized.canonical_image.uri, 'http://example.com/featured.jpg' );
					done( err );
				}
			);
		} );

		it( 'will pick post_thumbnail over featured_image if present and images missing', function( done ) {
			normalizer(
				{
					featured_image: 'http://example.com/featured.jpg',
					post_thumbnail: { URL: 'http://example.com/thumb.jpg', width: 1000, height: 1000, mime_type: '' },
					featured_media: {
						type: 'image',
						uri: 'http://example.com/media.jpg'
					}
				},
				[ normalizer.pickCanonicalImage ], function( err, normalized ) {
					assert.strictEqual( normalized.canonical_image.uri, 'http://example.com/thumb.jpg' );
					done( err );
				}
			);
		} );
	} );

	describe( 'keepValidImages', function() {
		it( 'should filter post.images based on size', function() {
			function fakeImage( width, height ) {
				return {
					width: width,
					height: height
				};
			}
			let post = {
					images: [
						fakeImage( 5, 201 ),
						fakeImage( 101, 5 ),
						fakeImage( 100, 200 )
					],
					content_images: [
						fakeImage( 5, 201 ),
						fakeImage( 101, 5 ),
						fakeImage( 100, 200 ),
						fakeImage( 101, 201 )
					]
				},
				callbackSpy = new Spy();

			normalizer.keepValidImages( 100, 200 )( post, callbackSpy );

			assert.isTrue( callbackSpy.called );

			assert.lengthOf( post.images, 1 );
			assert.lengthOf( post.content_images, 2 );
		} );
	} );

	describe( 'content.makeEmbedsSafe', function() {
		it( 'makes iframes safe, rewriting to ssl and sandboxing', function( done ) {
			normalizer(
				{
					content: '<iframe src="http://example.com"></iframe>'
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeEmbedsSafe ] ) ], function( err, normalized ) {
					assert.strictEqual( normalized.content, '<iframe src="https://example.com/" sandbox=""></iframe>' );
					done( err );
				}
			);
		} );

		it( 'allows trusted sources to be unsandboxed', function( done ) {
			normalizer(
				{
					content: '<iframe src="http://spotify.com"></iframe>'
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeEmbedsSafe ] ) ], function( err, normalized ) {
					assert.strictEqual( normalized.content, '<iframe src="https://spotify.com/"></iframe>' );
					done( err );
				}
			);
		} );

		it( 'applies the right level of sandboxing to whitelisted sources', function( done ) {
			normalizer(
				{
					content: '<iframe src="http://youtube.com"></iframe>'
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeEmbedsSafe ] ) ], function( err, normalized ) {
					assert.strictEqual( normalized.content, '<iframe src="https://youtube.com/" sandbox="allow-same-origin allow-scripts allow-popups"></iframe>' );
					done( err );
				}
			);
		} );

		it( 'removes iframes with an empty src', function( done ) {
			normalizer(
				{
					content: '<iframe src=""></iframe>'
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeEmbedsSafe ] ) ], function( err, normalized ) {
					assert.strictEqual( normalized.content, '' );
					done( err );
				}
			);
		} );

		it( 'removes objects from external posts', function( done ) {
			normalizer(
				{
					is_external: true,
					content: '<object data="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="></object>'
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeEmbedsSafe ] ) ], function( err, normalized ) {
					assert.strictEqual( normalized.content, '' );
					done( err );
				}
			);
		} );

		it( 'removes embeds from external posts', function( done ) {
			normalizer(
				{
					is_external: true,
					content: '<embed src="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">'
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeEmbedsSafe ] ) ], function( err, normalized ) {
					assert.strictEqual( normalized.content, '' );
					done( err );
				}
			);
		} );
	} );

	describe( 'content.detectMedia', function() {
		it( 'detects whitelisted iframes', function( done ) {
			normalizer(
				{
					content: '<iframe width="100" height="50" src="https://youtube.com"></iframe>'
				},
				[ normalizer.withContentDOM( [ normalizer.content.detectMedia ] ) ], function( err, normalized ) {
					let embed;
					assert.lengthOf( normalized.content_embeds, 1 );

					embed = normalized.content_embeds[ 0 ];
					assert.strictEqual( embed.iframe, '<iframe width="100" height="50" src="https://youtube.com"></iframe>' );
					assert.strictEqual( embed.height, 50 );
					assert.strictEqual( embed.width, 100 );
					assert.isNull( embed.type );
					assert.strictEqual( embed.aspectRatio, 2 );

					done( err );
				}
			);
		} );
		it( 'detects trusted iframes', function( done ) {
			normalizer(
				{
					content: '<iframe width="100" height="50" src="https://embed.spotify.com"></iframe>'
				},
				[ normalizer.withContentDOM( [ normalizer.content.detectMedia ] ) ], function( err, normalized ) {
					let embed;
					assert.lengthOf( normalized.content_embeds, 1 );

					embed = normalized.content_embeds[ 0 ];
					assert.strictEqual( embed.iframe, '<iframe width="100" height="50" src="https://embed.spotify.com"></iframe>' );
					done( err );
				}
			);
		} );
		it( 'detects youtube embed', function( done ) {
			normalizer(
				{
					content: '<p><span class="embed-youtube">' +
					'<iframe src="https://YouTube.com"></iframe>' +
					'</span></p>',
				},
				[
					normalizer.withContentDOM( [ normalizer.content.detectMedia ] )
				], function( err, normalized ) {
					assert.strictEqual( normalized.content_embeds[ 0 ].type, 'youtube' );
					done( err );
				}
			);
		} );
		it( 'detects vimeo embed', function( done ) {
			normalizer(
				{
					content: '<div class="embed-vimeo">' +
					'<iframe src="https://Vimeo.com"></iframe>' +
					'</div>',
				},
				[
					normalizer.withContentDOM( [ normalizer.content.detectMedia ] )
				], function( err, normalized ) {
					assert.strictEqual( normalized.content_embeds[ 0 ].type, 'vimeo' );
					done( err );
				}
			);
		} );
		it( 'empty content yields undefined', function( done ) {
			normalizer(
				{
					content: '',
				},
				[
					normalizer.withContentDOM( [ normalizer.content.detectMedia ] )
				], function( err, normalized ) {
					assert.isUndefined( normalized.content_embeds );
					done( err );
				}
			);
		} );
		it( 'content with no embeds yields an empty array', function( done ) {
			normalizer(
				{
					content: '<p>foo</p>',
				},
				[
					normalizer.withContentDOM( [ normalizer.content.detectMedia ] )
				], function( err, normalized ) {
					assert.deepEqual( normalized.content_embeds, [] );
					done( err );
				}
			);
		} );
		it( 'ignores embeds from non-whitelisted providers', function( done ) {
			const badSrcs = [
				'http://example.com',
				'http://example.com?src=http://youtube.com',
				'http://example.com?src=http://YouTube.com',
				'http://foobar.youtube.com.example.com/',
				'http://foobaryoutube.com/',
				'https://notspotify.com/'
			];
			const badContent = badSrcs.map( ( src ) => ( '<iframe src="' + src + '"></iframe>' ) ).join( '\n' );
			normalizer(
				{
					content: badContent,
				},
				[
					normalizer.withContentDOM( [ normalizer.content.detectMedia ] )
				], function( err, normalized ) {
					assert.deepEqual( normalized.content_embeds, [], 'No content_embeds should have been found' );
					done( err );
				}
			);
		} );
		it( 'links to embedded Polldaddy polls', function( done ) {
			normalizer(
				{
					content: '<a name="pd_a_8980420"></a>' +
					'<div class="PDS_Poll" id="PDI_container8980420" style="display:inline-block;"></div>' +
					'<div id="PD_superContainer"></div>' +
					'<script type="text/javascript" charset="UTF-8" src="//static.polldaddy.com/p/8980420.js"></script>' +
					'<noscript><a href="http://polldaddy.com/poll/8980420">Take Our Poll</a></noscript>',
				},
				[
					normalizer.withContentDOM( [ normalizer.content.detectPolls ] )
				], function( err, normalized ) {
					assert.include( normalized.content, '<p><a target="_blank" rel="external noopener noreferrer" href="https://polldaddy.com/poll/8980420">Take our poll</a></p>' );
					done( err );
				}
			);
		} );

		it( 'removes elements by selector', function( done ) {
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
				[
					normalizer.withContentDOM( [ normalizer.content.removeElementsBySelector ] )
				], function( err, normalized ) {
					assert.equal( trim( normalized.content ), '' );
					done( err );
				}
			);
		} );
	} );

	describe( 'The fancy excerpt creator', function() {
		function assertExcerptBecomes( source, expected, done ) {
			normalizer( { content: source }, [ normalizer.createBetterExcerpt ], function( err, normalized ) {
				assert.strictEqual( normalized.better_excerpt, expected );
				done( err );
			} );
		}

		it( 'strips empty elements and leading and trailing brs', function( done ) {
			assertExcerptBecomes( `<br>
<p>&nbsp;</p>
<p class="wp-caption-text">caption</p>
<p><img src="http://example.com/image.jpg"></p>
<p><a href="http://wikipedia.org">Giraffes</a> are <br>great</p>
<p></p>`, '<p>Giraffes are <br>great</p>', done );
		} );

		it( 'limits the excerpt to 3 elements', function( done ) {
			assertExcerptBecomes( '<p>one</p><p>two</p><p>three</p><p>four</p>', '<p>one</p><p>two</p><p>three</p>', done );
		} );

		it( 'limits the excerpt to 3 elements after trimming', function( done ) {
			assertExcerptBecomes(
				'<br /><p></p><p>one</p><p>two</p><p></p><br><p>three</p><p>four</p><br><p></p>',
				'<p>one</p><p>two</p><br>',
				done
			);
		} );

		it( 'only trims top-level breaks', function( done ) {
			assertExcerptBecomes( '<p></p><p>one<br>two</p>', '<p>one<br>two</p>', done );
		} );

		it( 'removes style tags', done => {
			assertExcerptBecomes(
				'<style>#foo{ color: blue; }</style><p>hi there</p>',
				'<p>hi there</p>',
				done
			);
		} );
	} );

	describe( 'The refreshed fancy excerpt creator', () => {
		function assertExcerptBecomes( source, expected, done ) {
			normalizer( { content: source }, [ normalizer.createBetterExcerptRefresh ], function( err, normalized ) {
				assert.strictEqual( normalized.better_excerpt, expected );
				done( err );
			} );
		}

		it( 'removes tags but inserts spaces between p tags', function( done ) {
			assertExcerptBecomes( '<p>one</p><p>two</p><p>three</p><p>four</p>', 'one two three four ', done );
		} );

		it( 'turns br tags into spaces', function( done ) {
			assertExcerptBecomes( '<p>one<br>two<br/>three</p>', 'one two three ', done );
		} );
	} );
} );
