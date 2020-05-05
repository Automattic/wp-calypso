/**
 * External dependencies
 */
import { expect } from 'chai';
import { forEach, repeat } from 'lodash';

/**
 * Internal dependencies
 */
import * as DISPLAY_TYPES from '../display-types';
import { classifyPost } from '../normalization-rules';
import addDiscoverProperties from 'lib/post-normalizer/rule-add-discover-properties';
import { isFeaturedImageInContent } from 'lib/post-normalizer/utils';

function verifyClassification( post, displayTypes ) {
	classifyPost( post );
	forEach( displayTypes, ( displayType ) => {
		expect( post.display_type & displayType ).to.equal( displayType );
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
					better_excerpt_no_html: repeat( 'no ', 10 ),
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
					better_excerpt_no_html: repeat( 'no ', 100 ),
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
					better_excerpt_no_html: repeat( 'no ', 5 ),
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
			expect( isFeaturedImageInContent( post ) ).to.be.equal( 1 );
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
			expect( isFeaturedImageInContent( post ) ).to.be.not.ok;
		} );
	} );

	describe( 'addDiscoverProperties', () => {
		const discoverSiteId = 53424024;
		describe( 'is_discover', () => {
			test( 'should always add is_discover properity to the post', () => {
				expect( addDiscoverProperties( {} ) ).to.have.ownProperty( 'is_discover' );
			} );

			test( 'should set is_discover to false if the post is not from discover', () => {
				const nonDiscoverPost = addDiscoverProperties( { site_ID: 1 } );
				expect( nonDiscoverPost.is_discover ).to.be.false;
			} );

			test( 'should set is_discover to true if the post has discover_metadata', () => {
				const discoverPost = addDiscoverProperties( { site_ID: 1, discover_metadata: {} } );
				expect( discoverPost.is_discover ).to.be.true;
			} );

			test( 'should set is_discover to true if the post is from discover', () => {
				const discoverPost = addDiscoverProperties( { site_ID: discoverSiteId } );
				expect( discoverPost.is_discover ).to.be.true;
			} );
		} );

		describe( 'discover_format', () => {
			test( 'should set the discover_format from the discover_metadata if present', () => {
				const discoverPost = {
					discover_metadata: {
						discover_fp_post_formats: [
							{
								name: 'Pick',
								slug: 'pick',
								id: 346750,
							},
							{
								name: 'Standard Pick',
								slug: 'standard-pick',
								id: 337879995,
							},
						],
					},
				};

				addDiscoverProperties( discoverPost );
				expect( discoverPost.discover_format ).to.equal( 'standard-pick' );
			} );

			test( 'should set the discover_format to "feature" if its from discover but discover_metadata is not present', () => {
				const discoverFeature = addDiscoverProperties( { site_ID: discoverSiteId } );
				expect( discoverFeature.discover_format ).to.equal( 'feature' );
			} );
		} );
	} );
} );
