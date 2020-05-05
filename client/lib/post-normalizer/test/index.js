/**
 * @jest-environment jsdom
 */
jest.mock( 'lib/safe-image-url', () => require( './mocks/lib/safe-image-url' ) );

/**
 * External dependencies
 */
import { flow, trim } from 'lodash';

/**
 * Internal dependencies
 */
import safeImageUrlFake from 'lib/safe-image-url';
import decodeEntities from '../rule-decode-entities';
import stripHtml from '../rule-strip-html';
import preventWidows from '../rule-prevent-widows';
import pickCanonicalImage from '../rule-pick-canonical-image';
import makeSiteIDSafeForAPI from '../rule-make-site-id-safe-for-api';
import pickPrimaryTag from '../rule-pick-primary-tag';
import safeImageProperties from '../rule-safe-image-properties';
import makeLinksSafe from '../rule-make-links-safe';
import keepValidImages from '../rule-keep-valid-images';
import createBetterExcerpt from '../rule-create-better-excerpt';
import waitForImagesToLoad from '../rule-wait-for-images-to-load';
import withContentDOM from '../rule-with-content-dom';
import detectMedia from '../rule-content-detect-media';
import detectPolls from '../rule-content-detect-polls';
import detectSurveys from '../rule-content-detect-surveys';
import { disableAutoPlayOnMedia, disableAutoPlayOnEmbeds } from '../rule-content-disable-autoplay';
import linkJetpackCarousels from '../rule-content-link-jetpack-carousels';
import makeEmbedsSafe from '../rule-content-make-embeds-safe';
import makeImagesSafe from '../rule-content-make-images-safe';
import makeContentLinksSafe from '../rule-content-make-links-safe';
import removeElementsBySelector from '../rule-content-remove-elements-by-selector';
import removeStyles from '../rule-content-remove-styles';

describe( 'index', () => {
	test( 'should leave an empty object alone', () => {
		const allTransforms = flow(
			decodeEntities,
			stripHtml,
			preventWidows,
			makeSiteIDSafeForAPI,
			pickPrimaryTag,
			safeImageProperties( 200 ),
			withContentDOM(),
			withContentDOM( [
				removeStyles,
				makeImagesSafe( 300 ),
				makeEmbedsSafe,
				detectMedia,
				makeContentLinksSafe,
			] ),
			createBetterExcerpt,
			pickCanonicalImage,
			keepValidImages( 1, 1 )
		);

		const normalized = allTransforms( {} );
		expect( normalized ).toEqual( {} );
	} );

	test( 'can decode entities', () => {
		const post = {
			title: 'title <i>&amp; bar</i>',
			excerpt: 'excerpt &amp; bar',
			author: {
				name: 'author &amp; <b>bar</b>',
			},
		};

		const normalized = decodeEntities( post );
		expect( normalized ).toEqual( {
			title: 'title <i>& bar</i>',
			excerpt: 'excerpt & bar',
			author: {
				name: 'author & <b>bar</b>',
			},
		} );
	} );

	test( 'can prevent widows', () => {
		const post = {
			excerpt: 'this is a longer excerpt bar',
		};

		const normalized = preventWidows( post );
		expect( normalized ).toEqual( {
			excerpt: 'this is a longer excerpt\xA0bar',
		} );
	} );

	test( 'can prevent widows in empty strings', () => {
		const post = {
			excerpt: '   ',
		};

		const normalized = preventWidows( post );
		expect( normalized ).toEqual( {
			excerpt: '',
		} );
	} );

	test( 'can remove html tags', () => {
		const post = {
			title: 'title <b>bar</b>',
			excerpt: 'excerpt <b style="foo">bar</style>',
			author: {
				name: 'author <b>b<i>a</i>r</b>',
			},
		};

		const normalized = stripHtml( post );
		expect( normalized ).toEqual( {
			title: 'title bar',
			excerpt: 'excerpt bar',
			author: {
				name: 'author bar',
			},
		} );
	} );

	describe( 'makeSiteIDSafeForAPI', () => {
		test( 'can make siteIDs into strings', () => {
			const post = {
				site_id: 12345,
			};
			const normalized = makeSiteIDSafeForAPI( post );
			expect( normalized.normalized_site_id ).toBe( '12345' );
		} );

		test( 'can normalized the site_id for the api by replacing :: with /', () => {
			const post = {
				site_id: 'foo::bar',
			};
			const normalized = makeSiteIDSafeForAPI( post );
			expect( normalized.normalized_site_id ).toBe( 'foo/bar' );
			expect( normalized.site_id ).toBe( 'foo::bar' );
		} );
	} );

	describe( 'safeImageProperties', () => {
		test( 'can make image properties safe', () => {
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
			const normalized = safeImageProperties( 200 )( post );
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
		} );

		test( 'will ignore featured_media that is not of type "image"', () => {
			const post = {
				featured_media: {
					uri: 'http://example.com/media.jpg',
				},
			};
			const normalized = safeImageProperties( 200 )( post );
			expect( normalized.featured_media.uri ).toBe( 'http://example.com/media.jpg' );
		} );
	} );

	describe( 'pickPrimaryTag', () => {
		test( 'can pick the primary tag by taking the tag with the highest post_count as the primary', () => {
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

			const normalized = pickPrimaryTag( post );
			expect( normalized.primary_tag ).toEqual( post.tags.second );
		} );

		test( 'can pick the primary tag by taking the first tag as primary if there is a tie', () => {
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

			const normalized = pickPrimaryTag( post );
			expect( normalized.primary_tag ).toEqual( post.tags.first );
		} );
	} );

	describe( 'content.disableAutoPlayOnMediaShortcodes', () => {
		test( 'should strip autoplay attributes from video', () => {
			const post = {
				content: '<video autoplay="1"></video>',
			};
			const normalized = withContentDOM( [ disableAutoPlayOnMedia ] )( post );
			expect( normalized ).toEqual( { content: '<video></video>' } );
		} );

		test( 'should strip autoplay attributes from audio', () => {
			const post = {
				content: '<audio autoplay="1"></audio>',
			};
			const normalized = withContentDOM( [ disableAutoPlayOnMedia ] )( post );
			expect( normalized ).toEqual( { content: '<audio></audio>' } );
		} );

		test( 'should strip autoplay like attributes from iframes', () => {
			const post = { content: '<iframe src="https://example.com/?autoplay=1"></iframe>' };
			const normalized = withContentDOM( [ disableAutoPlayOnEmbeds ] )( post );
			expect( normalized.content ).toBe(
				'<iframe src="https://example.com/?autoplay=0"></iframe>'
			);
		} );

		test( 'should strip multiple autoplay like attributes from iframes', () => {
			const post = {
				content: '<iframe src="https://example.com/?autoplay=1&autoplay=2"></iframe>',
			};
			const normalized = withContentDOM( [ disableAutoPlayOnEmbeds ] )( post );
			expect( normalized.content ).toBe(
				'<iframe src="https://example.com/?autoplay=0"></iframe>'
			);
		} );

		test( 'should reduce multiple autoplay like attributes to one value', () => {
			const post = {
				content: '<iframe src="https://example.com/?autoplay=0&autoplay=2"></iframe>',
			};
			const normalized = withContentDOM( [ disableAutoPlayOnEmbeds ] )( post );
			expect( normalized.content ).toBe(
				'<iframe src="https://example.com/?autoplay=0"></iframe>'
			);
		} );
	} );

	describe( 'the content normalizer (withContentDOM)', () => {
		test( 'should not call nested transforms if content is blank', () => {
			function failIfCalledTransform() {
				throw new Error( 'should not have been called' );
			}

			const post = {
				content: '',
			};

			const normalized = withContentDOM( [ failIfCalledTransform ] )( post );
			expect( normalized ).toEqual( post );
		} );

		test( 'should provide a DOM parameter to withContentDOM transforms', () => {
			function detectTimeTransform( post, dom ) {
				expect( dom ).toBeTruthy();
				expect( dom.querySelectorAll( 'time' ) ).toHaveLength( 1 );
				return post;
			}
			const post = {
				content: '<time>now</time>',
			};
			const normalized = withContentDOM( [ detectTimeTransform ] )( post );
			expect( normalized ).toBeTruthy();
		} );
	} );

	describe( 'content.removeStyles', () => {
		test( 'can strip style attributes and style elements', () => {
			const post = {
				content: '<style>.foo{}</style><div style="width: 100000px">some content</div>',
			};
			const normalized = withContentDOM( [ removeStyles ] )( post );
			expect( normalized.content ).toBe( '<div>some content</div>' );
		} );

		test( 'can strip align attributes from non images', () => {
			const post = {
				content: '<div align="left"><img align="right" />some content</div>',
			};
			const normalized = withContentDOM( [ removeStyles ] )( post );
			expect( normalized.content ).toBe( '<div><img align="right">some content</div>' );
		} );

		test( 'leaves galleries intact', () => {
			const post = {
				content:
					'<div class="gallery" style="width: 100000px"><style>.gallery{}</style><div style="width:100px">some content</div></div>',
			};
			const normalized = withContentDOM( [ removeStyles ] )( post );
			expect( normalized.content ).toBe(
				'<div class="gallery" style="width: 100000px">' +
					'<style>.gallery{}</style><div style="width:100px">some content</div></div>'
			);
		} );

		test( 'leaves twitter emdeds intact', () => {
			const post = {
				content:
					'<div class="embed-twitter"><blockquote class="twitter-tweet"><p lang="en" dir="ltr"></p></blockquote><script async="" src="//platform.twitter.com/widgets.js" charset="utf-8"></script></div>',
			};
			const normalized = withContentDOM( [ removeStyles ] )( post );
			expect( normalized.content ).toBe(
				'<div class="embed-twitter"><blockquote class="twitter-tweet">' +
					'<p lang="en" dir="ltr"></p></blockquote>' +
					'<script async="" src="//platform.twitter.com/widgets.js" charset="utf-8"></script></div>'
			);
		} );

		test( 'leaves instagram emdeds intact', () => {
			const post = {
				content:
					'<blockquote class="instagram-media" style="background:#FFF;"><div style="padding:8px;"><p style="margin:8px 0 0 0;"> <a style="color:#000;"></a></p></div></blockquote>',
			};
			const normalized = withContentDOM( [ removeStyles ] )( post );
			expect( normalized.content ).toBe(
				'<blockquote class="instagram-media" style="background:#FFF;">' +
					'<div style="padding:8px;">' +
					'<p style="margin:8px 0 0 0;"> <a style="color:#000;"></a></p>' +
					'</div>' +
					'</blockquote>'
			);
		} );
	} );

	describe( 'makeLinksSafe', () => {
		test( 'can make links in the post safe', () => {
			const post = { content: '', URL: 'javascript:foo' };
			const normalized = makeLinksSafe( post );
			expect( normalized.URL ).toBe( '' );
		} );
	} );

	describe( 'makeContentLinksSafe', () => {
		const badLinks = [
			'javascript:foo',
			'gopher:uminn.edu',
			'ftp://ftp.example.com',
			'telnet://localhost',
			'feed://example.com',
		];
		badLinks.forEach( ( badLink ) => {
			test( 'can remove javascript: links', () => {
				const post = { content: '<a href="' + badLink + '">hi there</a>' };
				const normalized = withContentDOM( [ makeContentLinksSafe ] )( post );
				expect( normalized.content ).toBe( '<a>hi there</a>' );
			} );
		} );
	} );

	describe( 'content.makeImagesSafe', () => {
		test( 'can route all images through wp-safe-image if no size specified', () => {
			const post = {
				content:
					'<img src="http://example.com/example.jpg"><img src="http://example.com/example2.jpg">',
			};
			const normalized = withContentDOM( [ makeImagesSafe() ] )( post );
			expect( normalized.content ).toBe(
				'<img src="http://example.com/example.jpg-SAFE"><img src="http://example.com/example2.jpg-SAFE">'
			);
		} );

		test( 'updates images with relative sources to use the post domain', () => {
			const post = {
				URL: 'http://example.wordpress.com/?post=123',
				content: '<img src="/example.jpg"><img src="example2.jpg">',
			};
			const normalized = withContentDOM( [ makeImagesSafe() ] )( post );
			expect( normalized.content ).toBe(
				'<img src="http://example.wordpress.com/example.jpg-SAFE">' +
					'<img src="http://example.wordpress.com/example2.jpg-SAFE">'
			);
		} );

		test( 'handles relative images with dot segments', () => {
			const post = {
				URL: 'http://example.wordpress.com/2015/01/my-post/',
				content: '<img src="../../../example.jpg">',
			};
			const normalized = withContentDOM( [ makeImagesSafe() ] )( post );
			expect( normalized.content ).toBe(
				'<img src="http://example.wordpress.com/example.jpg-SAFE">'
			);
		} );

		test( 'can route all images through photon if a size is specified', () => {
			const post = {
				content:
					'<img src="http://example.com/example.jpg"><img src="http://example.com/example2.jpg">',
			};
			const normalized = withContentDOM( [ makeImagesSafe( 400 ) ] )( post );
			expect( normalized.content ).toBe(
				'<img src="http://example.com/example.jpg-SAFE?quality=80&amp;strip=info&amp;w=400">' +
					'<img src="http://example.com/example2.jpg-SAFE?quality=80&amp;strip=info&amp;w=400">'
			);
		} );

		test( 'can remove images that cannot be made safe', () => {
			safeImageUrlFake.setReturns( null );
			const post = {
				content: '<img width="700" height="700" src="http://example.com/example.jpg?nope">',
			};
			const normalized = withContentDOM( [ makeImagesSafe( 400 ) ] )( post );
			expect( normalized.content ).toBe( '' );
			safeImageUrlFake.undoReturns();
		} );

		test( 'can allow images that cannot be made safe but are from secure hosts', () => {
			safeImageUrlFake.setReturns( null );
			const post = {
				content: '<img width="700" height="700" src="https://example.com/example.jpg?nope">',
			};
			const normalized = withContentDOM( [ makeImagesSafe( 400 ) ] )( post );
			expect( normalized.content ).toBe(
				'<img width="700" height="700" src="https://example.com/example.jpg?nope">'
			);
			safeImageUrlFake.undoReturns();
		} );

		test( 'removes event handlers from content images', () => {
			const post = {
				content: '<img onload="hi" onerror="there" src="http://example.com/example.jpg">',
			};
			const normalized = withContentDOM( [ makeImagesSafe() ] )( post );
			expect( normalized.content ).toBe( '<img src="http://example.com/example.jpg-SAFE">' );
		} );

		test( 'removes srcsets', () => {
			const post = {
				content:
					'<img src="http://example.com/example.jpg" srcset="http://example.com/example-100.jpg 100w, http://example.com/example-600.jpg 600w">',
			};
			const normalized = withContentDOM( [ makeImagesSafe() ] )( post );
			expect( normalized.content ).toBe( '<img src="http://example.com/example.jpg-SAFE">' );
		} );

		test( 'removes invalid srcsets', () => {
			const post = {
				content:
					'<img src="http://example.com/example.jpg" srcset="http://example.com/example-100-and-a-half.jpg 100.5w, http://example.com/example-600.jpg 600w">',
			};
			const normalized = withContentDOM( [ makeImagesSafe() ] )( post );
			expect( normalized.content ).toBe( '<img src="http://example.com/example.jpg-SAFE">' );
		} );
	} );

	describe( 'waitForImagesToLoad', () => {
		test.skip( 'should fire when all images have loaded or errored', () => {
			// these need to be objects that mimic the Image object
			const completeImage = {
					complete: true,
					src: 'http://example.com/one',
				},
				loadingImage = {
					complete: false,
					src: 'http://example.com/two',
					load: function () {
						this.onload();
					},
				},
				erroringImage = {
					complete: false,
					src: 'http://example.com/three',
					error: function () {
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

			return waitForImagesToLoad( post );
		} );

		test.skip( 'should dedupe the images to check', async () => {
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

			const normalized = await waitForImagesToLoad( post );
			expect( normalized.images ).toHaveLength( 2 );
		} );
	} );

	describe( 'canonical image picker', () => {
		test( 'can pick the canonical image from images', () => {
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

			const normalized = pickCanonicalImage( postRunThroughWaitForImagesToLoad );
			expect( normalized.images ).toEqual( postRunThroughWaitForImagesToLoad.images );
			expect( normalized.canonical_image.uri ).toBe( 'http://example.com/image.jpg' );
		} );

		test( 'will pick featured_image if present and images missing', () => {
			const post = {
				post_thumbnail: {
					URL: 'http://example.com/featured.jpg',
					width: 700,
					height: 200,
				},
			};
			const normalized = pickCanonicalImage( post );
			expect( normalized.canonical_image.uri ).toBe( 'http://example.com/featured.jpg' );
		} );

		test( 'will pick post_thumbnail over featured_image if present and images missing', () => {
			const post = {
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
			};
			const normalized = pickCanonicalImage( post );
			expect( normalized.canonical_image.uri ).toBe( 'http://example.com/thumb.jpg' );
		} );
	} );

	describe( 'keepValidImages', () => {
		test( 'should filter post.images based on size', () => {
			function fakeImage( width, height ) {
				return { width, height };
			}

			const post = {
				images: [ fakeImage( 5, 201 ), fakeImage( 101, 5 ), fakeImage( 100, 200 ) ],
				content_images: [
					fakeImage( 5, 201 ),
					fakeImage( 101, 5 ),
					fakeImage( 100, 200 ),
					fakeImage( 101, 201 ),
				],
			};

			const normalized = keepValidImages( 100, 200 )( post );

			expect( normalized.images ).toHaveLength( 1 );
			expect( normalized.content_images ).toHaveLength( 2 );
		} );
	} );

	describe( 'content.makeEmbedsSafe', () => {
		test( 'makes iframes safe, rewriting to ssl and sandboxing', () => {
			const post = {
				content: '<iframe src="http://example.com"></iframe>',
			};
			const normalized = withContentDOM( [ makeEmbedsSafe ] )( post );
			expect( normalized.content ).toBe(
				'<iframe src="https://example.com/" sandbox=""></iframe>'
			);
		} );

		test( 'allows trusted sources to be unsandboxed', () => {
			const post = {
				content: '<iframe src="http://spotify.com"></iframe>',
			};
			const normalized = withContentDOM( [ makeEmbedsSafe ] )( post );
			expect( normalized.content ).toBe( '<iframe src="https://spotify.com/"></iframe>' );
		} );

		test( 'applies the right level of sandboxing to whitelisted sources', () => {
			const post = {
				content: '<iframe src="http://youtube.com"></iframe>',
			};
			const normalized = withContentDOM( [ makeEmbedsSafe ] )( post );
			expect( normalized.content ).toBe(
				'<iframe src="https://youtube.com/" sandbox="allow-same-origin allow-scripts allow-popups"></iframe>'
			);
		} );

		test( 'removes iframes with an empty src', () => {
			const post = {
				content: '<iframe src=""></iframe>',
			};
			const normalized = withContentDOM( [ makeEmbedsSafe ] )( post );
			expect( normalized.content ).toBe( '' );
		} );

		test( 'removes objects from external posts', () => {
			const post = {
				is_external: true,
				content:
					'<object data="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="></object>',
			};
			const normalized = withContentDOM( [ makeEmbedsSafe ] )( post );
			expect( normalized.content ).toBe( '' );
		} );

		test( 'removes embeds from external posts', () => {
			const post = {
				is_external: true,
				content: '<embed src="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">',
			};
			const normalized = withContentDOM( [ makeEmbedsSafe ] )( post );
			expect( normalized.content ).toBe( '' );
		} );
	} );

	describe( 'content.detectMedia', () => {
		test( 'detects whitelisted iframes', () => {
			const post = {
				content: '<iframe width="100" height="50" src="https://youtube.com"></iframe>',
			};
			const normalized = withContentDOM( [ detectMedia ] )( post );
			expect( normalized.content_embeds ).toHaveLength( 1 );

			const embed = normalized.content_embeds[ 0 ];
			expect( embed.iframe ).toBe(
				'<iframe width="100" height="50" src="https://youtube.com"></iframe>'
			);
			expect( embed.height ).toBe( 50 );
			expect( embed.width ).toBe( 100 );
			expect( embed.type ).toBeNull();
			expect( embed.aspectRatio ).toBe( 2 );
		} );

		test( 'detects images intermixed with embeds and in the correct order', () => {
			const post = {
				content:
					'<img src="example1.png" /> <iframe src="https://vimeo.com/v/hi"></iframe> <img src="example2.png" />',
			};
			const normalized = withContentDOM( [ detectMedia ] )( post );
			expect( normalized.content_media ).toHaveLength( 3 );
			expect( normalized.content_images ).toHaveLength( 2 );
			expect( normalized.content_embeds ).toHaveLength( 1 );
			expect( normalized.content_media[ 0 ] ).toBe( normalized.content_images[ 0 ] );
			expect( normalized.content_media[ 1 ] ).toBe( normalized.content_embeds[ 0 ] );
			expect( normalized.content_media[ 2 ] ).toBe( normalized.content_images[ 1 ] );
		} );

		test( 'detects images', () => {
			const post = {
				content: `<img src="example1.png" />
					<img src="/relativeurl.png" />
					<img src="https://google.com/images/absoluteurl.jpg"> text in the middle</img>`,
			};
			const normalized = withContentDOM( [ detectMedia ] )( post );
			expect( normalized.content_media ).toHaveLength( 3 );
			expect( normalized.content_images ).toHaveLength( 3 );
			expect( normalized.content_embeds ).toHaveLength( 0 );
		} );

		test( 'detects trusted iframes', () => {
			const post = {
				content: '<iframe width="100" height="50" src="https://embed.spotify.com"></iframe>',
			};
			const normalized = withContentDOM( [ detectMedia ] )( post );
			expect( normalized.content_embeds ).toHaveLength( 1 );

			const embed = normalized.content_embeds[ 0 ];
			expect( embed.iframe ).toBe(
				'<iframe width="100" height="50" src="https://embed.spotify.com"></iframe>'
			);
		} );

		test( 'detects youtube embed', () => {
			const post = {
				content:
					'<p><span class="embed-youtube">' +
					'<iframe src="https://YouTube.com"></iframe>' +
					'</span></p>',
			};
			const normalized = withContentDOM( [ detectMedia ] )( post );
			expect( normalized.content_embeds[ 0 ].type ).toBe( 'youtube' );
		} );

		test( 'detects vimeo embed', () => {
			const post = {
				content:
					'<div class="embed-vimeo">' + '<iframe src="https://Vimeo.com"></iframe>' + '</div>',
			};
			const normalized = withContentDOM( [ detectMedia ] )( post );
			expect( normalized.content_embeds[ 0 ].type ).toBe( 'vimeo' );
		} );

		test( 'empty content yields undefined', () => {
			const post = {
				content: '',
			};
			const normalized = withContentDOM( [ detectMedia ] )( post );
			expect( normalized.content_embeds ).toBeUndefined();
		} );

		test( 'content with no embeds yields an empty array', () => {
			const post = {
				content: '<p>foo</p>',
			};
			const normalized = withContentDOM( [ detectMedia ] )( post );
			expect( normalized.content_embeds ).toEqual( [] );
		} );

		test( 'ignores embeds from non-whitelisted providers', () => {
			const badSrcs = [
				'http://example.com',
				'http://example.com?src=http://youtube.com',
				'http://example.com?src=http://YouTube.com',
				'http://foobar.youtube.com.example.com/',
				'http://foobaryoutube.com/',
				'https://notspotify.com/',
			];
			const badContent = badSrcs
				.map( ( src ) => '<iframe src="' + src + '"></iframe>' )
				.join( '\n' );
			const post = {
				content: badContent,
			};
			const normalized = withContentDOM( [ detectMedia ] )( post );
			expect( normalized.content_embeds ).toEqual( [] );
		} );

		test.each( [
			[ 'http://polldaddy.com/poll/8980420', 8980420 ],
			[ 'https://polldaddy.com/poll/8980420', 8980420 ],
			[ 'https://poll.fm/12345678', 12345678 ],
			[ 'https://survey.fm/12345678', 12345678 ],
		] )( 'links to embedded Crowdsignal polls', ( url, id ) => {
			const post = {
				content:
					'<a name="pd_a_8980420"></a>' +
					'<div class="PDS_Poll" id="PDI_container8980420" style="display:inline-block;"></div>' +
					'<div id="PD_superContainer"></div>' +
					'<script type="text/javascript" charset="UTF-8" src="//static.polldaddy.com/p/8980420.js"></script>' +
					`<noscript><a href="${ url }">Take Our Poll</a></noscript>`,
			};
			const normalized = withContentDOM( [ detectPolls ] )( post );
			expect( normalized.content ).toEqual(
				expect.stringContaining(
					`<p><a target="_blank" rel="external noopener noreferrer" href="https://poll.fm/${ id }">Take our poll</a></p>`
				)
			);
		} );

		test.each( [ [ 'pd-embed' ], [ 'cs-embed' ] ] )(
			'links to embedded Crowdsignal surveys',
			( className ) => {
				const post = {
					content:
						'<div class="embed-polldaddy">' +
						`<div class="${ className }" data-settings="{&quot;type&quot;:&quot;iframe&quot;,&quot;auto&quot;:true,&quot;domain&quot;:&quot;bluefuton.polldaddy.com/s/&quot;,&quot;id&quot;:&quot;what-s-your-favourite-bird&quot;}">` +
						'</div>',
				};
				const normalized = withContentDOM( [ detectSurveys ] )( post );
				expect( normalized.content ).toEqual(
					expect.stringContaining(
						'<p><a target="_blank" rel="external noopener noreferrer" href="https://bluefuton.polldaddy.com/s/what-s-your-favourite-bird">Take our survey</a></p>'
					)
				);
			}
		);

		test( 'removes elements by selector', () => {
			const post = {
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
			};
			const normalized = withContentDOM( [ removeElementsBySelector ] )( post );
			expect( trim( normalized.content ) ).toBe( '' );
		} );
	} );

	describe( 'The fancy excerpt creator', () => {
		function assertExcerptBecomes( source, expected ) {
			const normalized = createBetterExcerpt( { content: source } );
			expect( normalized.better_excerpt ).toBe( expected );
		}

		test( 'strips empty elements, leading brs, and styling attributes', () => {
			assertExcerptBecomes(
				`<br>
                <p>&nbsp;</p>
                <p class="wp-caption">caption</p>
                <p><img src="http://example.com/image.jpg"></p>
                <p align="left" style="text-align:right"><a href="http://wikipedia.org">Giraffes</a> are <br>great</p>
                <p></p>`,
				'<p>Giraffes are <br>great</p>'
			);
		} );

		test( 'strips leading brs even if they are nested', () => {
			assertExcerptBecomes(
				'<p><br>deep meaning lies within</p>',
				'<p>deep meaning lies within</p>'
			);
		} );

		test( 'strips multiple leading brs even if nested', () => {
			assertExcerptBecomes(
				'<p><br><br><br></p><br><p><br></p>deep meaning lies within',
				'deep meaning lies within'
			);
		} );

		test( 'only trims break if there is no preceding text', () => {
			assertExcerptBecomes( '<p>one<br>two</p>', '<p>one<br>two</p>' );
		} );

		test( 'limits the excerpt to 3 elements', () => {
			assertExcerptBecomes(
				'<p>one</p><p>two</p><p>three</p><p>four</p>',
				'<p>one</p><p>two</p><p>three</p>'
			);
		} );

		test( 'limits the excerpt to 3 elements after trimming', () => {
			assertExcerptBecomes(
				'<br /><p></p><p>one</p><p>two</p><p></p><br><p>three</p><p>four</p><br><p></p>',
				'<p>one</p><p>two</p><br>'
			);
		} );

		test( 'removes style tags', () => {
			assertExcerptBecomes(
				'<style>#foo{ color: blue; }</style><p>hi there</p>',
				'<p>hi there</p>'
			);
		} );

		test( 'builds the content without html', () => {
			const post = { content: '<style>#foo{ color: blue; }</style><p>hi there</p>' };
			const normalized = createBetterExcerpt( post );
			expect( normalized.content_no_html ).toBe( 'hi there' );
		} );
	} );

	describe( 'Jetpack Carousel Linker', () => {
		test( 'should fix links to jetpack carousels', () => {
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
			const normalized = withContentDOM( [ linkJetpackCarousels ] )( { content: source } );
			expect( normalized.content.trim() ).toEqual( expected.trim() );
		} );
	} );
} );
