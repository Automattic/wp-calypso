/**
 * @jest-environment jsdom
 */

import { deserialize } from '../';
import { MediaTypes } from '../constants';

describe( 'MediaSerialization', () => {
	describe( '#deserialize()', () => {
		test( 'should parse a caption shortcode string containing an image', () => {
			const parsed = deserialize(
				'[caption id="attachment_1627" align="aligncenter" width="660"]<img class="size-full wp-image-1627" src="https://andrewmduthietest.files.wordpress.com/2015/01/img_0372.jpg" alt="Example" width="660" height="660" /> Ceramic[/caption]'
			);

			expect( parsed.type ).toEqual( MediaTypes.IMAGE );
			expect( parsed.media.ID ).toEqual( 1627 );
			expect( parsed.media.caption ).toEqual( 'Ceramic' );
			expect( parsed.media.URL ).toEqual(
				'https://andrewmduthietest.files.wordpress.com/2015/01/img_0372.jpg'
			);
			expect( parsed.media.alt ).toEqual( 'Example' );
			expect( parsed.media.transient ).toBe( false );
			expect( parsed.media.width ).toEqual( 660 );
			expect( parsed.media.height ).toEqual( 660 );
			expect( parsed.appearance.align ).toEqual( 'center' );
			expect( parsed.appearance.size ).toEqual( 'full' );
		} );

		test( 'should parse an image string', () => {
			const parsed = deserialize(
				'<img class="size-full wp-image-1627 alignright" src="https://andrewmduthietest.files.wordpress.com/2015/01/img_0372.jpg" alt="Example" width="660" height="660" />'
			);

			expect( parsed.type ).toEqual( MediaTypes.IMAGE );
			expect( parsed.media.ID ).toEqual( 1627 );
			expect( parsed.media.URL ).toEqual(
				'https://andrewmduthietest.files.wordpress.com/2015/01/img_0372.jpg'
			);
			expect( parsed.media.alt ).toEqual( 'Example' );
			expect( parsed.media.transient ).toBe( false );
			expect( parsed.media.width ).toEqual( 660 );
			expect( parsed.media.height ).toEqual( 660 );
			expect( parsed.appearance.size ).toEqual( 'full' );
			expect( parsed.appearance.align ).toEqual( 'right' );
		} );

		test( 'should parse an image HTMLElement', () => {
			const img = document.createElement( 'img' );
			img.className = 'size-full wp-image-1627 alignright';
			img.src = 'https://andrewmduthietest.files.wordpress.com/2015/01/img_0372.jpg';
			img.alt = 'Example';
			img.width = 660;
			img.height = 660;
			const parsed = deserialize( img );

			expect( parsed.type ).toEqual( MediaTypes.IMAGE );
			expect( parsed.media.ID ).toEqual( 1627 );
			expect( parsed.media.URL ).toEqual(
				'https://andrewmduthietest.files.wordpress.com/2015/01/img_0372.jpg'
			);
			expect( parsed.media.alt ).toEqual( 'Example' );
			expect( parsed.media.transient ).toBe( false );
			expect( parsed.media.width ).toEqual( 660 );
			expect( parsed.media.height ).toEqual( 660 );
			expect( parsed.appearance.size ).toEqual( 'full' );
			expect( parsed.appearance.align ).toEqual( 'right' );
		} );

		test( 'should parse images with the data-istransient attribute as transient images', () => {
			const parsed = deserialize(
				'<img data-istransient="istransient" src="https://andrewmduthietest.files.wordpress.com/2015/01/img_0372.jpg" class="size-full wp-image-1627 alignright" alt="Example" width="660" height="660" />'
			);

			expect( parsed.media.transient ).toBe( true );
		} );

		test( 'should parse images without the data-istransient attribute as not transient images', () => {
			const parsed = deserialize(
				'<img src="blob:http%3A//wordpress.com/75205e1a-0f78-4a0b-b0e2-5f47a3471769" class="size-full wp-image-1627 alignright" alt="Example" width="660" height="660" />'
			);

			expect( parsed.media.transient ).toBe( false );
		} );

		test( 'should favor natural dimensions over inferred', () => {
			const img = document.createElement( 'img' );
			[ 'width', 'height' ].forEach( ( dimension ) => {
				Object.defineProperty( img, dimension, {
					get: () => 660,
				} );
			} );
			[ 'naturalWidth', 'naturalHeight' ].forEach( ( dimension ) => {
				Object.defineProperty( img, dimension, {
					get: () => 1320,
				} );
			} );
			const parsed = deserialize( img );

			expect( parsed.type ).toEqual( MediaTypes.IMAGE );
			expect( parsed.media.width ).toEqual( 1320 );
			expect( parsed.media.height ).toEqual( 1320 );
		} );

		test( 'should favor attribute dimensions over natural', () => {
			const img = document.createElement( 'img' );
			img.width = 660;
			img.height = 660;
			[ 'naturalWidth', 'naturalHeight' ].forEach( ( dimension ) => {
				Object.defineProperty( img, dimension, {
					get: () => 1320,
				} );
			} );
			img.setAttribute( 'width', '990' );
			img.setAttribute( 'height', '990' );
			const parsed = deserialize( img );

			expect( parsed.type ).toEqual( MediaTypes.IMAGE );
			expect( parsed.media.width ).toEqual( 990 );
			expect( parsed.media.height ).toEqual( 990 );
		} );

		test( 'should parse a REST API media object', () => {
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
				meta: {},
			};
			const parsed = deserialize( media );

			expect( parsed.type ).toEqual( MediaTypes.IMAGE );
			expect( parsed.media ).toEqual( Object.assign( { transient: false }, media ) );
			expect( parsed.appearance ).toEqual( {} );
		} );

		test( 'should gracefully handle an unknown format', () => {
			const parsed = deserialize();

			expect( parsed.type ).toEqual( MediaTypes.UNKNOWN );
			expect( parsed.media ).toEqual( {} );
			expect( parsed.appearance ).toEqual( {} );
		} );
	} );
} );
