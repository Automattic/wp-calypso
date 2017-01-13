/**
 * External Dependencies
 */
import { forEach, repeat } from 'lodash';
import { expect } from 'chai';

/**
 * Internal Dependencies
 */
import { classifyPost } from '../normalization-rules';
import * as DISPLAY_TYPES from '../display-types';
import { isFeaturedImageInContent } from 'lib/post-normalizer/utils';

function verifyClassification( post, displayTypes ) {
	classifyPost( post );
	forEach( displayTypes, displayType => {
		expect( post.display_type & displayType ).to.equal( displayType );
	} );
}

describe( 'normalization-rules', () => {
	describe( 'classifyPost', () => {
		it( 'should mark an empty post UNCLASSIFIED', () => {
			verifyClassification( {}, [ DISPLAY_TYPES.UNCLASSIFIED ] );
		} );

		it( 'should classify a PHOTO_ONLY post', () => {
			verifyClassification( {
				canonical_media: {
					mediaType: 'image',
					width: 1000
				},
				better_excerpt_no_html: repeat( 'no ', 10 )
			}, [ DISPLAY_TYPES.PHOTO_ONLY ] );
		} );

		it( 'should not classify a PHOTO_ONLY post if the content is too long', () => {
			verifyClassification( {
				canonical_media: {
					mediaType: 'image',
					width: 1000
				},
				better_excerpt_no_html: repeat( 'no ', 100 )
			}, [ DISPLAY_TYPES.UNCLASSIFIED ] );
		} );

		it( 'should classify a PHOTO_ONLY post if it has enough images for a gallery, but not all of them are big enough', () => {
			verifyClassification( {
				canonical_media: {
					mediaType: 'image',
					width: 1000
				},
				content_images: [
					{
						width: 1000
					},
					{
						width: 150
					},
					{
						width: 150
					},
					{
						width: 150
					},
				],
				better_excerpt_no_html: repeat( 'no ', 5 )
			}, [ DISPLAY_TYPES.PHOTO_ONLY ] );
		} );
	} );

	describe( 'isFeaturedImageInContent', () => {
		it( 'should say that a post has featured image in content if the featured image is in the content', () => {
			// post.images has the same src twice because that how our posts actually are.
			// featured_image is always first and then content_images follow
			const post = {
				post_thumbnail: {
					URL: 'http://example.com/foo/bar/ping.jpg?w=2',
				},
				images: [
					{
						src: 'http://example.com/foo/bar/ping.jpg?w=2'
					},
					{
						src: 'http://example.com/foo/bar/ping.jpg?w=20'
					},
				]
			};
			expect( isFeaturedImageInContent( post ) ).to.be.equal( 1 );
		} );

		it( 'should say that featured image is not in content if featured image is not in content', () => {
			const post = {
				post_thumbnail: {
					URL: 'http://example.com/foo/baz/ping.jpg?w=2',
				},
				images: [
					{
						src: 'http://example2.com/foo/bar/different.jpg?w=20',
					}
				],
			};
			expect( isFeaturedImageInContent( post ) ).to.be.not.ok;
		} );
	} );
} );
