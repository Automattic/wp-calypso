/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import { deserialize } from '../';
import { MediaTypes } from '../constants';

describe( 'MediaSerialization', function() {
	useFakeDom();

	describe( '#deserialize()', function() {
		it( 'should parse a caption shortcode string containing an image', function() {
			const parsed = deserialize( '[caption id="attachment_1627" align="aligncenter" width="660"]<img class="size-full wp-image-1627" src="https://andrewmduthietest.files.wordpress.com/2015/01/img_0372.jpg" alt="Example" width="660" height="660" /> Ceramic[/caption]' );

			expect( parsed.type ).to.equal( MediaTypes.IMAGE );
			expect( parsed.media.ID ).to.equal( 1627 );
			expect( parsed.media.caption ).to.equal( 'Ceramic' );
			expect( parsed.media.URL ).to.equal( 'https://andrewmduthietest.files.wordpress.com/2015/01/img_0372.jpg' );
			expect( parsed.media.alt ).to.equal( 'Example' );
			expect( parsed.media.transient ).to.be.false;
			expect( parsed.media.width ).to.equal( 660 );
			expect( parsed.media.height ).to.equal( 660 );
			expect( parsed.appearance.align ).to.equal( 'center' );
			expect( parsed.appearance.size ).to.equal( 'full' );
		} );

		it( 'should parse an image string', function() {
			const parsed = deserialize( '<img class="size-full wp-image-1627 alignright" src="https://andrewmduthietest.files.wordpress.com/2015/01/img_0372.jpg" alt="Example" width="660" height="660" />' );

			expect( parsed.type ).to.equal( MediaTypes.IMAGE );
			expect( parsed.media.ID ).to.equal( 1627 );
			expect( parsed.media.URL ).to.equal( 'https://andrewmduthietest.files.wordpress.com/2015/01/img_0372.jpg' );
			expect( parsed.media.alt ).to.equal( 'Example' );
			expect( parsed.media.transient ).to.be.false;
			expect( parsed.media.width ).to.equal( 660 );
			expect( parsed.media.height ).to.equal( 660 );
			expect( parsed.appearance.size ).to.equal( 'full' );
			expect( parsed.appearance.align ).to.equal( 'right' );
		} );

		it( 'should parse an image HTMLElement', function() {
			let img = document.createElement( 'img' );
			img.className = 'size-full wp-image-1627 alignright';
			img.src = 'https://andrewmduthietest.files.wordpress.com/2015/01/img_0372.jpg';
			img.alt = 'Example';
			img.width = 660;
			img.height = 660;
			const parsed = deserialize( img );

			expect( parsed.type ).to.equal( MediaTypes.IMAGE );
			expect( parsed.media.ID ).to.equal( 1627 );
			expect( parsed.media.URL ).to.equal( 'https://andrewmduthietest.files.wordpress.com/2015/01/img_0372.jpg' );
			expect( parsed.media.alt ).to.equal( 'Example' );
			expect( parsed.media.transient ).to.be.false;
			expect( parsed.media.width ).to.equal( 660 );
			expect( parsed.media.height ).to.equal( 660 );
			expect( parsed.appearance.size ).to.equal( 'full' );
			expect( parsed.appearance.align ).to.equal( 'right' );
		} );

		it( 'should detect transient images', function() {
			const parsed = deserialize( '<img src="blob:http%3A//wordpress.com/75205e1a-0f78-4a0b-b0e2-5f47a3471769" class="size-full wp-image-1627 alignright" alt="Example" width="660" height="660" />' );

			expect( parsed.media.transient ).to.be.true;
		} );

		it( 'should favor natural dimensions over inferred', function() {
			let img = document.createElement( 'img' );
			[ 'width', 'height' ].forEach( ( dimension ) => {
				Object.defineProperty( img, dimension, {
					get: () => 660
				} );
			} );
			[ 'naturalWidth', 'naturalHeight' ].forEach( ( dimension ) => {
				Object.defineProperty( img, dimension, {
					get: () => 1320
				} );
			} );
			const parsed = deserialize( img );

			expect( parsed.type ).to.equal( MediaTypes.IMAGE );
			expect( parsed.media.width ).to.equal( 1320 );
			expect( parsed.media.height ).to.equal( 1320 );
		} );

		it( 'should favor attribute dimensions over natural', function() {
			let img = document.createElement( 'img' );
			img.width = 660;
			img.height = 660;
			[ 'naturalWidth', 'naturalHeight' ].forEach( ( dimension ) => {
				Object.defineProperty( img, dimension, {
					get: () => 1320
				} );
			} );
			img.setAttribute( 'width', '990' );
			img.setAttribute( 'height', '990' );
			const parsed = deserialize( img );

			expect( parsed.type ).to.equal( MediaTypes.IMAGE );
			expect( parsed.media.width ).to.equal( 990 );
			expect( parsed.media.height ).to.equal( 990 );
		} );

		it( 'should parse a REST API media object', function() {
			const media = {
				ID: 3062,
				URL: 'https://andrewmduthietest.files.wordpress.com/2015/08/sunset1.jpg',
				guid: 'http://andrewmduthietest.files.wordpress.com/2015/08/sunset1.jpg',
				date: '2015-08-18T11:32:58-04:00',
				post_ID: 0,
				file: 'sunset1.jpg',
				mime_type: 'image/jpeg',
				extension: 'jpg',
				title: 'Sunset',
				caption: 'Skyline',
				description: '',
				alt: '',
				thumbnails: {},
				height: 804,
				width: 1150,
				exif: {},
				meta: {}
			};
			const parsed = deserialize( media );

			expect( parsed.type ).to.equal( MediaTypes.IMAGE );
			expect( parsed.media ).to.eql( Object.assign( { transient: false }, media ) );
			expect( parsed.appearance ).to.eql( {} );
		} );

		it( 'should gracefully handle an unknown format', function() {
			const parsed = deserialize();

			expect( parsed.type ).to.equal( MediaTypes.UNKNOWN );
			expect( parsed.media ).to.eql( {} );
			expect( parsed.appearance ).to.eql( {} );
		} );
	} );
} );
