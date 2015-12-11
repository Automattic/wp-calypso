/* eslint-disable vars-on-top */

/**
 * External dependencies
 */
var ReactDomServer = require( 'react-dom/server' ),
	chai = require( 'chai' ),
	expect = chai.expect,
	sinon = require( 'sinon' ),
	sinonChai = require( 'sinon-chai' );

chai.use( sinonChai );

/**
 * Internal dependencies
 */
var markup = require( '../../markup' ),
	sites = require( 'lib/sites-list' )();

describe( 'markup', function() {
	var sandbox;

	beforeEach( function() {
		sandbox = sinon.sandbox.create();
	} );

	afterEach( function() {
		sandbox.restore();
	} );

	describe( '#get()', function() {
		it( 'should return an empty string if not passed any arguments', function() {
			var value = markup.get();

			expect( value ).to.equal( '' );
		} );

		it( 'should defer to a specific mime type handler if one exists', function() {
			sandbox.stub( markup.mimeTypes, 'image' );
			markup.get( { mime_type: 'image/png' } );

			expect( markup.mimeTypes.image ).to.have.been.called;
		} );

		it( 'should return a link for a mime type prefix without a specific handler', function() {
			sandbox.stub( markup, 'link' );
			markup.get( { mime_type: 'application/pdf' } );

			expect( markup.link ).to.have.been.called;
		} );
	} );

	describe( '#link()', function() {
		it( 'should return a link for a mime type prefix without a specific handler', function() {
			var value = markup.link( {
				URL: 'http://example.com/wp-content/uploads/document.pdf',
				title: 'document'
			} );

			expect( value ).to.equal( '<a href="http://example.com/wp-content/uploads/document.pdf" title="document">document</a>' );
		} );
	} );

	describe( '#caption()', function() {
		it( 'should accept a media object, returning a caption element', function() {
			var value = markup.caption( {
				ID: 1,
				URL: 'https://s1.wp.com/wp-content/themes/a8c/automattic-2011/images/automattic-logo.png',
				alt: 'Automattic',
				caption: 'Logo',
				thumbnails: {},
				width: 276
			} );

			expect( value.type ).to.equal( 'dl' );
			expect( ReactDomServer.renderToStaticMarkup( value ) ).to.equal( '<dl class="wp-caption" style="width:276px;"><dt class="wp-caption-dt"><img src="https://s1.wp.com/wp-content/themes/a8c/automattic-2011/images/automattic-logo.png" alt="Automattic" width="276" class="alignnone size-full wp-image-1"></dt><dd class="wp-caption-dd">Logo</dd></dl>' );
		} );

		it( 'should accept a non-captioned image, returning null', function() {
			var value = markup.caption( {
				ID: 1,
				URL: 'https://s1.wp.com/wp-content/themes/a8c/automattic-2011/images/automattic-logo.png',
				alt: 'Automattic',
				thumbnails: {},
				width: 276
			} );

			expect( value ).to.be.null;
		} );

		it( 'should accept a captioned string, returning a React element', function() {
			var value = markup.caption( '[caption id="attachment_1627" align="aligncenter" width="660"]<img class="size-full wp-image-1627" src="https://andrewmduthietest.files.wordpress.com/2015/01/img_0372.jpg" alt="Example" width="660" height="660" /> Ceramic[/caption]' );

			expect( value.type ).to.equal( 'dl' );
			expect( ReactDomServer.renderToStaticMarkup( value ) ).to.equal( '<dl class="wp-caption aligncenter" style="width:660px;"><dt class="wp-caption-dt"><img class="size-full wp-image-1627" src="https://andrewmduthietest.files.wordpress.com/2015/01/img_0372.jpg" alt="Example" width="660" height="660" /></dt><dd class="wp-caption-dd">Ceramic</dd></dl>' );
		} );
	} );

	describe( '.mimeTypes', function() {
		describe( '#image()', function() {
			beforeEach( function() {
				sandbox.stub( sites, 'getSelectedSite', function() {
					return {};
				} );
			} );

			it( 'should not set width auto if media width cannot be determined', function() {
				var value = markup.mimeTypes.image( {
					ID: 'media-4',
					URL: 'blob:http%3A//example.com/ddd1d6b0-f31b-4937-ae9e-97f1d660cf71',
					thumbnails: {}
				} );

				expect( value ).to.equal( '<img src="blob:http%3A//example.com/ddd1d6b0-f31b-4937-ae9e-97f1d660cf71" class="alignnone size-full wp-image-media-4">' );
			} );

			it( 'should return an img element for an image', function() {
				var value = markup.mimeTypes.image( {
					ID: 1,
					URL: 'https://s1.wp.com/wp-content/themes/a8c/automattic-2011/images/automattic-logo.png',
					alt: 'Automattic',
					thumbnails: {},
					width: 276
				} );

				expect( value ).to.equal( '<img src="https://s1.wp.com/wp-content/themes/a8c/automattic-2011/images/automattic-logo.png" alt="Automattic" width="276" class="alignnone size-full wp-image-1">' );
			} );

			it( 'should respect the max width for a site size', function() {
				sites.getSelectedSite.restore();
				sandbox.stub( sites, 'getSelectedSite', function() {
					return {
						options: {
							image_large_width: 1024,
							image_large_height: 1024
						}
					};
				} );

				const value = markup.mimeTypes.image( {
					ID: 1,
					URL: 'http://example.com/image.png',
					thumbnails: {},
					width: 5000,
					height: 2000
				}, { size: 'large' } );

				sites.getSelectedSite.restore();

				expect( value ).to.equal( '<img src="http://example.com/image.png?w=1024" width="1024" height="410" class="alignnone size-large wp-image-1">' );
			} );

			it( 'should respect the max height for a site size', function() {
				sites.getSelectedSite.restore();
				sandbox.stub( sites, 'getSelectedSite', function() {
					return {
						options: {
							image_large_width: 1024,
							image_large_height: 1024
						}
					};
				} );

				const value = markup.mimeTypes.image( {
					ID: 1,
					URL: 'http://example.com/image.png',
					thumbnails: {},
					width: 2000,
					height: 5000
				}, { size: 'large' } );

				sites.getSelectedSite.restore();

				expect( value ).to.equal( '<img src="http://example.com/image.png?w=410" width="410" height="1024" class="alignnone size-large wp-image-1">' );
			} );

			it( 'should include a resize parameter if forceResize option passed', function() {
				var value = markup.mimeTypes.image( {
					ID: 1,
					URL: 'https://s1.wp.com/wp-content/themes/a8c/automattic-2011/images/automattic-logo.png',
					alt: 'Automattic',
					thumbnails: {},
					width: 276
				}, { forceResize: true } );

				expect( value ).to.equal( '<img src="https://s1.wp.com/wp-content/themes/a8c/automattic-2011/images/automattic-logo.png?w=276" alt="Automattic" width="276" class="alignnone size-full wp-image-1">' );
			} );

			it( 'should avoid XSS because React', function() {
				var value = markup.mimeTypes.image( {
					ID: 1,
					URL: '""><SCRIPT>alert("XSS")</SCRIPT>"',
					thumbnails: {},
					width: 276
				} );

				expect( value ).to.equal( '<img src="&quot;&quot;&gt;&lt;SCRIPT&gt;alert(&quot;XSS&quot;)&lt;/SCRIPT&gt;&quot;" width="276" class="alignnone size-full wp-image-1">' );
			} );

			it( 'should attempt to find the site\'s thumbnail width if a size is specified', function() {
				var value;

				sites.getSelectedSite.restore();
				sandbox.stub( sites, 'getSelectedSite', function() {
					return {
						options: {
							image_large_width: 200
						}
					};
				} );

				value = markup.mimeTypes.image( {
					ID: 1,
					URL: 'https://s1.wp.com/wp-content/themes/a8c/automattic-2011/images/automattic-logo.png',
					alt: 'Automattic',
					thumbnails: {},
					width: 276
				}, { size: 'large' } );

				sites.getSelectedSite.restore();

				expect( value ).to.equal( '<img src="https://s1.wp.com/wp-content/themes/a8c/automattic-2011/images/automattic-logo.png?w=200" alt="Automattic" width="200" class="alignnone size-large wp-image-1">' );
			} );

			it( 'should attempt to find the media\'s own thumbnail width if a size is specified', function() {
				var value;

				sites.getSelectedSite.restore();
				sandbox.stub( sites, 'getSelectedSite', function() {
					return { jetpack: true };
				} );

				value = markup.mimeTypes.image( {
					ID: 1,
					URL: 'http://example.com/wp-content/uploads/2015/05/logo11w.png',
					alt: 'WordPress',
					thumbnails: {
						large: 'http://example.com/wp-content/uploads/2015/05/logo11w-1024x1024.png'
					},
					width: 5380
				}, { size: 'large' } );

				sites.getSelectedSite.restore();

				expect( value ).to.equal( '<img src="http://example.com/wp-content/uploads/2015/05/logo11w-1024x1024.png" alt="WordPress" width="1024" class="alignnone size-large wp-image-1">' );
			} );

			it( 'should wrap a captioned image in a caption shortcode', function() {
				var value = markup.mimeTypes.image( {
					ID: 1,
					URL: 'https://s1.wp.com/wp-content/themes/a8c/automattic-2011/images/automattic-logo.png',
					alt: 'Automattic',
					caption: 'Logo',
					thumbnails: {},
					width: 276
				} );

				expect( value ).to.equal( '[caption id="attachment_1" width="276"]<img src="https://s1.wp.com/wp-content/themes/a8c/automattic-2011/images/automattic-logo.png" alt="Automattic" width="276" class="alignnone size-full wp-image-1"> Logo[/caption]' );
			} );

			it( 'should calculate the height when specifying a size', function() {
				var value = markup.mimeTypes.image( {
					ID: 1,
					URL: 'https://s1.wp.com/wp-content/themes/a8c/automattic-2011/images/automattic-logo.png',
					alt: 'Automattic',
					thumbnails: {},
					width: 2760,
					height: 300
				}, { size: 'large' } );

				expect( value ).to.equal( '<img src="https://s1.wp.com/wp-content/themes/a8c/automattic-2011/images/automattic-logo.png?w=1024" alt="Automattic" width="1024" height="111" class="alignnone size-large wp-image-1">' );
			} );
		} );

		describe( '#audio()', function() {
			it( 'should return an `audio` shortcode for an audio item', function() {
				var value = markup.mimeTypes.audio( {
					URL: 'http://example.com/wp-content/uploads/2015/06/loop.mp3'
				} );

				expect( value ).to.equal( '[audio src="http://example.com/wp-content/uploads/2015/06/loop.mp3"][/audio]' );
			} );
		} );

		describe( '#video()', function() {
			it( 'should return a `wpvideo` shortcode for a VideoPress video', function() {
				var value = markup.mimeTypes.video( {
					videopress_guid: '11acMj3O'
				} );

				expect( value ).to.equal( '[wpvideo 11acMj3O]' );
			} );

			it( 'should return a `video` shortcode for a video', function() {
				var value = markup.mimeTypes.video( {
					URL: 'http://example.com/wp-content/uploads/2015/06/loop.mp4',
					height: 454,
					width: 1436
				} );

				expect( value ).to.equal( '[video src="http://example.com/wp-content/uploads/2015/06/loop.mp4" height="454" width="1436"][/video]' );
			} );
		} );
	} );
} );
