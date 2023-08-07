/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["verifyClassification", "expect"] }] */

import { forEach } from 'lodash';
import { isFeaturedImageInContent } from 'calypso/lib/post-normalizer/utils';
import DISPLAY_TYPES from '../display-types';
import { classifyPost } from '../normalization-rules';

function verifyClassification( post, displayTypes ) {
	classifyPost( post );
	forEach( displayTypes, ( displayType ) => {
		expect( post.display_type & displayType ).toEqual( displayType );
	} );
}

describe( 'normalization-rules', () => {
	describe( 'classifyPost', () => {
		test( 'should mark an empty post UNCLASSIFIED', () => {
			verifyClassification( {}, [ DISPLAY_TYPES.UNCLASSIFIED ] );
		} );

		test( 'should classify a PHOTO_ONLY post', () => {
			verifyClassification(
				{
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
					canonical_media: {
						mediaType: 'image',
						width: 1000,
					},
					better_excerpt_no_html: 'no '.repeat( 100 ),
				},
				[ DISPLAY_TYPES.UNCLASSIFIED ]
			);
		} );

		test( 'should classify a PHOTO_ONLY post if it has enough images for a gallery, but not all of them are big enough', () => {
			verifyClassification(
				{
					canonical_media: {
						mediaType: 'image',
						width: 1000,
					},
					content_images: [
						{
							width: 1000,
						},
						{
							width: 50,
						},
						{
							width: 50,
						},
						{
							width: 50,
						},
					],
					better_excerpt_no_html: 'no '.repeat( 5 ),
				},
				[ DISPLAY_TYPES.PHOTO_ONLY ]
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
} );
