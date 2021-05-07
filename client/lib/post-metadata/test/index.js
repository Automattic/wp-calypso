/**
 * External dependencies
 */

import { expect } from 'chai';

/**
 * Internal dependencies
 */
import PostMetadata from '../';

describe( 'index', () => {
	describe( '#publicizeMessage()', () => {
		test( 'should return undefined if passed a falsey value', () => {
			const value = PostMetadata.publicizeMessage( undefined );

			expect( value ).to.be.undefined;
		} );

		test( 'should return undefined if metadata not assigned to post', () => {
			const value = PostMetadata.publicizeMessage( {} );

			expect( value ).to.be.undefined;
		} );

		test( 'should return undefined if metadata contains no message', () => {
			const value = PostMetadata.publicizeMessage( { metadata: [] } );

			expect( value ).to.be.undefined;
		} );

		test( 'should return the message if metadata contains message', () => {
			const message = 'Post with Taxonomies';
			const value = PostMetadata.publicizeMessage( {
				metadata: [ { id: '796', key: '_wpas_mess', value: message } ],
			} );

			expect( value ).to.equal( message );
		} );
	} );

	describe( '#publicizeSkipped()', () => {
		test( 'should return undefined if passed a falsey value', () => {
			const value = PostMetadata.publicizeSkipped( undefined );

			expect( value ).to.be.undefined;
		} );

		test( 'should return an empty array if metadata not assigned to post', () => {
			const value = PostMetadata.publicizeSkipped( {} );

			expect( value ).to.be.instanceof( Array );
			expect( value ).to.be.empty;
		} );

		test( 'should return an empty array if metadata contains no skipped services', () => {
			const value = PostMetadata.publicizeSkipped( { metadata: [] } );

			expect( value ).to.be.instanceof( Array );
			expect( value ).to.be.empty;
		} );

		test( 'should return an array of numeric IDs of skipped services in the metadata', () => {
			const ID = 11491646;
			const value = PostMetadata.publicizeSkipped( {
				metadata: [ { id: '797', key: '_wpas_skip_' + ID, value: '1' } ],
			} );

			expect( value ).to.eql( [ ID ] );
		} );

		test( 'should only return IDs of services where metadata value is equal to "1"', () => {
			const ID = 11491646;
			const value = PostMetadata.publicizeSkipped( {
				metadata: [ { id: '797', key: '_wpas_skip_' + ID, value: '0' } ],
			} );

			expect( value ).to.be.empty;
		} );
	} );
} );
