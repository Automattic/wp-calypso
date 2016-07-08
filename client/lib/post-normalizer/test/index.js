/**
 * External dependencies
 */
const assert = require( 'chai' ).assert,
	Spy = require( 'sinon' ).spy;

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
				normalizer.content.safeContentImages( 300 ),
				normalizer.content.makeEmbedsSecure,
				normalizer.content.detectEmbeds,
				normalizer.content.wordCountAndReadingTime
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
		var post = {};
		normalizer( post, [ identifyTransform ], function( err, normalized ) {
			assert.notStrictEqual( normalized, post );
			done( err );
		} );
	} );

	it( 'should leave an empty object alone', function( done ) {
		var post = {};
		normalizer( post, allTransforms, function( err, normalized ) {
			assert.deepEqual( normalized, post );
			done( err );
		} );
	} );

	it( 'should support async transforms', function( done ) {
		var post = {
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
		var post = {
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
		var post = {
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
		var post = {
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
		var post = {
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
			var post = {
				author: {
					avatar_URL: 'http://example.com/me.jpg'
				},
				featured_image: 'http://foo.bar/',
				featured_media: {
					uri: 'http://example.com/media.jpg',
					type: 'image'
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
				assert.strictEqual( normalized.author.avatar_URL, 'http://example.com/me.jpg-SAFE?w=200&quality=80&strip=info' );
				assert.strictEqual( normalized.featured_image, 'http://foo.bar/-SAFE?w=200&quality=80&strip=info' );
				assert.strictEqual( normalized.featured_media.uri, 'http://example.com/media.jpg-SAFE?w=200&quality=80&strip=info' );
				assert.strictEqual( normalized.attachments[ '1234' ].URL, 'http://example.com/media.jpg-SAFE?w=200&quality=80&strip=info' );
				assert.strictEqual( normalized.attachments[ '3456' ].URL, 'http://example.com/media.jpg' );
				done( err );
			} );
		} );

		it( 'will ignore featured_media that is not of type "image"', function( done ) {
			var post = {
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
			var post = {
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
			var post = {
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
			var post = {
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

	describe( 'content.safeContentImages', function() {
		it( 'can route all images through wp-safe-image if no size specified', function( done ) {
			normalizer(
				{
					content: '<img src="http://example.com/example.jpg"><img src="http://example.com/example2.jpg">'
				},
				[ normalizer.withContentDOM( [ normalizer.content.safeContentImages() ] ) ], function( err, normalized ) {
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
				[ normalizer.withContentDOM( [ normalizer.content.safeContentImages() ] ) ], function( err, normalized ) {
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
				[ normalizer.withContentDOM( [ normalizer.content.safeContentImages() ] ) ], function( err, normalized ) {
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
				[ normalizer.withContentDOM( [ normalizer.content.safeContentImages( 400 ) ] ) ], function( err, normalized ) {
					assert.equal( normalized.content, '<img src="http://example.com/example.jpg-SAFE?w=400&amp;quality=80&amp;strip=info"><img src="http://example.com/example2.jpg-SAFE?w=400&amp;quality=80&amp;strip=info">' );
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
				[ normalizer.withContentDOM( [ normalizer.content.safeContentImages( 400 ) ] ) ], function( err, normalized ) {
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
				[ normalizer.withContentDOM( [ normalizer.content.safeContentImages() ] ) ], function( err, normalized ) {
					assert.equal( normalized.content, '<img src="http://example.com/example.jpg-SAFE">' );
					done( err );
				}
			);
		} );

		it( 'fixes up srcsets', function( done ) {
			normalizer(
				{
					content: '<img src="http://example.com/example.jpg" srcset="http://example.com/example-100.jpg 100w, http://example.com/example-600.jpg 600w">'
				},
				[ normalizer.withContentDOM( [ normalizer.content.safeContentImages() ] ) ], function( err, normalized ) {
					assert.equal( normalized.content, '<img src="http://example.com/example.jpg-SAFE" srcset="http://example.com/example-100.jpg-SAFE 100w, http://example.com/example-600.jpg-SAFE 600w">' );
					done( err );
				}
			);
		} );
	} );

	describe( 'content.wordCountAndReadingTime', function() {
		function assertCountAndTime( content, count, time, done ) {
			normalizer(
				{
					content: content
				},
				[ normalizer.withContentDOM( [ normalizer.content.wordCountAndReadingTime ] ) ], function( err, normalized ) {
					assert.strictEqual( normalized.word_count, count );
					assert.strictEqual( normalized.reading_time, time );
					done( err );
				}
			);
		}

		function assertTimeForCount( count, time, done ) {
			assertCountAndTime( ( new Array( count + 1 ) ).join( ' word ' ), count, time, done );
		}

		it( 'is undefined for empty content', function( done ) {
			assertCountAndTime( '', undefined, undefined, done );
		} );

		it( 'has zero words, no time, with only punctuation', function( done ) {
			assertCountAndTime( ';:,.?¿\-!¡', 0, undefined, done );
		} );

		it( 'can deal with html in the content', function( done ) {
			assertCountAndTime( '<p>This is a sentence , made ,. up of words!</p>', 8, 2, done );
		} );

		it( 'can deal with urls', function( done ) {
			assertCountAndTime( 'welcome to http://example.com?foo=bar, another college website', 6, 2, done );
		} );

		it( 'reading time matches the expected breakpoints', function( done ) {
			function doneIfError( err ) {
				if ( err ) {
					done( err );
				}
			}
			assertTimeForCount( 1, 1, doneIfError );
			assertTimeForCount( 4, 1, doneIfError );
			assertTimeForCount( 5, 2, doneIfError );
			assertTimeForCount( 8, 2, doneIfError );
			assertTimeForCount( 9, 3, doneIfError );
			assertTimeForCount( 12, 3, doneIfError );
			assertTimeForCount( 13, 4, doneIfError );

			done();
		} );
	} );

	describe( 'waitForImagesToLoad', function() {
		it.skip( 'should fire when all images have loaded or errored', function( done ) {
			// these need to be objects that mimic the Image object
			var completeImage = {
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
			var first = {
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
			var postRunThroughWaitForImagesToLoad = {
				images: [
					null, // null reference
					{
						naturalHeight: 1,
						naturalWidth: 1
					}, // too small
					{
						naturalHeight: 351,
						naturalWidth: 5
					}, // too narrow
					{
						naturalHeight: 5,
						naturalWidth: 351
					}, // too short
					{
						naturalHeight: 351,
						naturalWidth: 351,
						src: 'http://example.com/image.jpg'
					}, // YES
					{
						naturalHeight: 3500,
						naturalWidth: 3500
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
	} );

	describe( 'keepValidImages', function() {
		it( 'should filter post.images based on size', function() {
			function fakeImage( width, height ) {
				return {
					naturalWidth: width,
					naturalHeight: height
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

	describe( 'content.makeEmbedsSecure', function() {
		it( 'makes iframes safe, rewriting to ssl and sandboxing', function( done ) {
			normalizer(
				{
					content: '<iframe src="http://example.com"></iframe>'
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeEmbedsSecure ] ) ], function( err, normalized ) {
					assert.strictEqual( normalized.content, '<iframe src="https://example.com/" sandbox=""></iframe>' );
					done( err );
				}
			);
		} );

		it( 'removes iframes with an empty src', function( done ) {
			normalizer(
				{
					content: '<iframe src=""></iframe>'
				},
				[ normalizer.withContentDOM( [ normalizer.content.makeEmbedsSecure ] ) ], function( err, normalized ) {
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
				[ normalizer.withContentDOM( [ normalizer.content.makeEmbedsSecure ] ) ], function( err, normalized ) {
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
				[ normalizer.withContentDOM( [ normalizer.content.makeEmbedsSecure ] ) ], function( err, normalized ) {
					assert.strictEqual( normalized.content, '' );
					done( err );
				}
			);
		} );
	} );

	describe( 'content.contentEmbeds', function() {
		it( 'detects whitelisted iframes and alters the sandbox', function( done ) {
			normalizer(
				{
					content: '<iframe width="100" height="50" src="https://youtube.com"></iframe>'
				},
				[ normalizer.withContentDOM( [ normalizer.content.detectEmbeds ] ) ], function( err, normalized ) {
					var embed;
					assert.lengthOf( normalized.content_embeds, 1 );

					embed = normalized.content_embeds[ 0 ];
					assert.strictEqual( embed.iframe, '<iframe width="100" height="50" src="https://youtube.com" sandbox="allow-same-origin allow-scripts allow-popups"></iframe>' );
					assert.strictEqual( embed.height, 50 );
					assert.strictEqual( embed.width, 100 );
					assert.isNull( embed.type );
					assert.strictEqual( embed.aspectRatio, 2 );

					done( err );
				}
			);
		} );
		it( 'detects trusted iframes and removes the sandbox', function( done ) {
			normalizer(
				{
					content: '<iframe width="100" height="50" src="https://embed.spotify.com"></iframe>'
				},
				[ normalizer.withContentDOM( [ normalizer.content.detectEmbeds ] ) ], function( err, normalized ) {
					var embed;
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
					normalizer.withContentDOM( [ normalizer.content.detectEmbeds ] )
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
					normalizer.withContentDOM( [ normalizer.content.detectEmbeds ] )
				], function( err, normalized ) {
					assert.strictEqual( normalized.content_embeds[ 0 ].type, 'vimeo' );
					done( err );
				}
			);
		} );
		it( 'detects special instagram embed', function( done ) {
			normalizer(
				{
					content: '<blockquote class="instagram-media"><div></div></blockquote>'
				},
				[
					normalizer.withContentDOM( [ normalizer.content.detectEmbeds ] )
				], function( err, normalized ) {
					assert.strictEqual( normalized.content_embeds[ 0 ].type, 'special-instagram' );
					done( err );
				}
			);
		} );
		it( 'detects special twitter embed', function( done ) {
			normalizer(
				{
					content: '<blockquote class="twitter-video"><div></div></blockquote>'
				},
				[
					normalizer.withContentDOM( [ normalizer.content.detectEmbeds ] )
				], function( err, normalized ) {
					assert.strictEqual( normalized.content_embeds[ 0 ].type, 'special-twitter' );
					done( err );
				}
			);
		} );
		// skipping for now because jsdom doesn't like namespaced elements
		it.skip( 'detects special facebook post embed', function( done ) {
			normalizer(
				{
					content: '<fb:post data-href="http://facebook.com"></fb:post>'
				},
				[
					normalizer.withContentDOM( [ normalizer.content.detectEmbeds ] )
				], function( err, normalized ) {
					assert.strictEqual( normalized.content_embeds[ 0 ].type, 'special-facebook' );
					done( err );
				}
			);
		} );
		it( 'detects special facebook embed', function( done ) {
			normalizer(
				{
					content: '<div class="fb-video"><div></div></div>'
				},
				[
					normalizer.withContentDOM( [ normalizer.content.detectEmbeds ] )
				], function( err, normalized ) {
					assert.strictEqual( normalized.content_embeds[ 0 ].type, 'special-facebook' );
					done( err );
				}
			);
		} );
		it( 'empty content does not set the array', function( done ) {
			normalizer(
				{
					content: '',
				},
				[
					normalizer.withContentDOM( [ normalizer.content.detectEmbeds ] )
				], function( err, normalized ) {
					assert.isUndefined( normalized.content_embeds );
					done( err );
				}
			);
		} );
		it( 'content with no embeds does not set the array', function( done ) {
			normalizer(
				{
					content: '<p>foo</p>',
				},
				[
					normalizer.withContentDOM( [ normalizer.content.detectEmbeds ] )
				], function( err, normalized ) {
					assert.isUndefined( normalized.content_embeds );
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
					normalizer.withContentDOM( [ normalizer.content.detectEmbeds ] )
				], function( err, normalized ) {
					assert.isUndefined( normalized.content_embeds, 'No content_embeds should have been found' );
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
					assert.include( normalized.content, '<p><a rel="external" target="_blank" href="https://polldaddy.com/poll/8980420">Take our poll</a></p>' );
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
			assertExcerptBecomes( '<br /><p></p><p>one</p><p>two</p><p></p><br><p>three</p><p>four</p><br><p></p>', '<p>one</p><p>two</p><br>', done );
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
} );
