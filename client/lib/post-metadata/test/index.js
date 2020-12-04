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

	describe( '#publicizeDone()', () => {
		test( 'should return undefined if passed a falsey value', () => {
			const value = PostMetadata.publicizeDone( undefined );

			expect( value ).to.be.undefined;
		} );

		test( 'should return an empty array if metadata not assigned to post', () => {
			const value = PostMetadata.publicizeDone( {} );

			expect( value ).to.be.instanceof( Array );
			expect( value ).to.be.empty;
		} );

		test( 'should return an empty array if metadata contains no done services', () => {
			const value = PostMetadata.publicizeDone( { metadata: [] } );

			expect( value ).to.be.instanceof( Array );
			expect( value ).to.be.empty;
		} );

		test( 'should return an array of numeric IDs of done services in the metadata', () => {
			const ID = 11491646;
			const value = PostMetadata.publicizeDone( {
				metadata: [ { id: '797', key: '_wpas_done_' + ID, value: '1' } ],
			} );

			expect( value ).to.eql( [ ID ] );
		} );

		test( 'should only return IDs of services where metadata value is equal to "1"', () => {
			const ID = 11491646;
			const value = PostMetadata.publicizeDone( {
				metadata: [ { id: '797', key: '_wpas_done_' + ID, value: '0' } ],
			} );

			expect( value ).to.be.empty;
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

	describe( '#geoLabel()', () => {
		test( 'should return undefined if passed a falsey value', () => {
			const value = PostMetadata.geoLabel( undefined );

			expect( value ).to.be.undefined;
		} );

		test( 'should return undefined if metadata not assigned to post', () => {
			const value = PostMetadata.geoLabel( {} );

			expect( value ).to.be.undefined;
		} );

		test( 'should return undefined if metadata contains no geolocation address', () => {
			const value = PostMetadata.geoLabel( { metadata: [] } );

			expect( value ).to.be.undefined;
		} );

		test( 'should return the address if metadata contains geolocation address', () => {
			const address = 'New York, NY, USA';
			const value = PostMetadata.geoLabel( {
				metadata: [ { id: '796', key: 'geo_address', value: address } ],
			} );

			expect( value ).to.equal( address );
		} );
	} );

	describe( '#geoCoordinates()', () => {
		test( 'should return undefined if passed a falsey value', () => {
			const value = PostMetadata.geoCoordinates( undefined );

			expect( value ).to.be.undefined;
		} );

		test( 'should return undefined if metadata not assigned to post', () => {
			const value = PostMetadata.geoCoordinates( {} );

			expect( value ).to.be.undefined;
		} );

		test( 'should return undefined if metadata contains no geolocation coordinate', () => {
			const value = PostMetadata.geoCoordinates( { metadata: [] } );

			expect( value ).to.be.undefined;
		} );

		test( 'should return undefined if metadata contains only one of latitude or longitude', () => {
			const value = PostMetadata.geoCoordinates( {
				metadata: [ { id: '796', key: 'geo_latitude', value: '40.7127837' } ],
			} );

			expect( value ).to.be.undefined;
		} );

		test( 'should return an array of float values if metadata contains coordinate', () => {
			const latitude = 40.7127837;
			const longitude = -74.00594130000002;
			const value = PostMetadata.geoCoordinates( {
				metadata: [
					{ id: '796', key: 'geo_latitude', value: latitude.toString() },
					{ id: '796', key: 'geo_longitude', value: longitude.toString() },
				],
			} );

			expect( value ).to.be.eql( [ latitude, longitude ] );
		} );
	} );

	describe( '#geoIsSharedPublicy()', () => {
		test( 'should return true if passed a falsey value', () => {
			const value = PostMetadata.geoIsSharedPublicly( undefined );

			expect( value ).to.be.null;
		} );

		test( 'should return true if metadata not assigned to post', () => {
			const value = PostMetadata.geoIsSharedPublicly( {} );

			expect( value ).to.be.true;
		} );

		test( 'should return true if metadata contains no geo_public field', () => {
			const value = PostMetadata.geoIsSharedPublicly( { metadata: [] } );

			expect( value ).to.be.true;
		} );

		test( 'should return false if geo_public meta field is falsey', () => {
			const value = PostMetadata.geoIsSharedPublicly( {
				metadata: [ { id: '800', key: 'geo_public', value: '0' } ],
			} );

			expect( value ).to.be.false;
		} );

		test( 'should return true if geo_public meta field is truthy', () => {
			const value = PostMetadata.geoIsSharedPublicly( {
				metadata: [ { id: '800', key: 'geo_public', value: '1' } ],
			} );

			expect( value ).to.be.true;
		} );
	} );
} );
