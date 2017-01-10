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

		it( 'should classify a post as CANONICAL_IN_CONTENT', () => {
			verifyClassification( {
				canonical_image: {
					mediaType: 'image',
					width: 1000,
					uri: 'http://example.com/foo/bar/ping.jpg?w=2'
				},
				content_images: [
					{
						src: 'http://example2.com/foo/bar/ping.jpg?w=20'
					}
				]
			}, [ DISPLAY_TYPES.CANONICAL_IN_CONTENT ] );
		} );

		it( 'should not classify a post as CANONICAL_IN_CONTENT if the canonical image is not in the content', () => {
			verifyClassification( {
				canonical_image: {
					mediaType: 'image',
					width: 1000,
					uri: 'http://example.com/foo/baz/ping.jpg?w=2'
				},
				content_images: [
					{
						src: 'http://example2.com/foo/bar/different.jpg?w=20'
					}
				]
			}, [ DISPLAY_TYPES.UNCLASSIFIED ] );
		} );
	} );
} );
