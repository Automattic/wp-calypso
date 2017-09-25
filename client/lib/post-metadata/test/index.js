/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import PostMetadata from '../';

describe( 'index', function() {
	describe( '#publicizeMessage()', function() {
		it( 'should return undefined if passed a falsey value', function() {
			const value = PostMetadata.publicizeMessage( undefined );

			expect( value ).to.be.undefined;
		} );

		it( 'should return undefined if metadata not assigned to post', function() {
			const value = PostMetadata.publicizeMessage( {} );

			expect( value ).to.be.undefined;
		} );

		it( 'should return undefined if metadata contains no message', function() {
			const value = PostMetadata.publicizeMessage( { metadata: [] } );

			expect( value ).to.be.undefined;
		} );

		it( 'should return the message if metadata contains message', function() {
			let message = 'Post with Taxonomies',
				value;

			value = PostMetadata.publicizeMessage( {
				metadata: [
					{ id: '796', key: '_wpas_mess', value: message }
				]
			} );

			expect( value ).to.equal( message );
		} );
	} );

	describe( '#publicizeDone()', function() {
		it( 'should return undefined if passed a falsey value', function() {
			const value = PostMetadata.publicizeDone( undefined );

			expect( value ).to.be.undefined;
		} );

		it( 'should return an empty array if metadata not assigned to post', function() {
			const value = PostMetadata.publicizeDone( {} );

			expect( value ).to.be.instanceof( Array );
			expect( value ).to.be.empty;
		} );

		it( 'should return an empty array if metadata contains no done services', function() {
			const value = PostMetadata.publicizeDone( { metadata: [] } );

			expect( value ).to.be.instanceof( Array );
			expect( value ).to.be.empty;
		} );

		it( 'should return an array of numeric IDs of done services in the metadata', function() {
			let ID = 11491646,
				value;

			value = PostMetadata.publicizeDone( {
				metadata: [
					{ id: '797', key: '_wpas_done_' + ID, value: '1' }
				]
			} );

			expect( value ).to.eql( [ ID ] );
		} );

		it( 'should only return IDs of services where metadata value is equal to "1"', function() {
			let ID = 11491646,
				value;

			value = PostMetadata.publicizeDone( {
				metadata: [
					{ id: '797', key: '_wpas_done_' + ID, value: '0' }
				]
			} );

			expect( value ).to.be.empty;
		} );
	} );

	describe( '#publicizeSkipped()', function() {
		it( 'should return undefined if passed a falsey value', function() {
			const value = PostMetadata.publicizeSkipped( undefined );

			expect( value ).to.be.undefined;
		} );

		it( 'should return an empty array if metadata not assigned to post', function() {
			const value = PostMetadata.publicizeSkipped( {} );

			expect( value ).to.be.instanceof( Array );
			expect( value ).to.be.empty;
		} );

		it( 'should return an empty array if metadata contains no skipped services', function() {
			const value = PostMetadata.publicizeSkipped( { metadata: [] } );

			expect( value ).to.be.instanceof( Array );
			expect( value ).to.be.empty;
		} );

		it( 'should return an array of numeric IDs of skipped services in the metadata', function() {
			let ID = 11491646,
				value;

			value = PostMetadata.publicizeSkipped( {
				metadata: [
					{ id: '797', key: '_wpas_skip_' + ID, value: '1' }
				]
			} );

			expect( value ).to.eql( [ ID ] );
		} );

		it( 'should only return IDs of services where metadata value is equal to "1"', function() {
			let ID = 11491646,
				value;

			value = PostMetadata.publicizeSkipped( {
				metadata: [
					{ id: '797', key: '_wpas_skip_' + ID, value: '0' }
				]
			} );

			expect( value ).to.be.empty;
		} );
	} );

	describe( '#geoLabel()', function() {
		it( 'should return undefined if passed a falsey value', function() {
			const value = PostMetadata.geoLabel( undefined );

			expect( value ).to.be.undefined;
		} );

		it( 'should return undefined if metadata not assigned to post', function() {
			const value = PostMetadata.geoLabel( {} );

			expect( value ).to.be.undefined;
		} );

		it( 'should return undefined if metadata contains no geolocation address', function() {
			const value = PostMetadata.geoLabel( { metadata: [] } );

			expect( value ).to.be.undefined;
		} );

		it( 'should return the address if metadata contains geolocation address', function() {
			let address = 'New York, NY, USA',
				value;

			value = PostMetadata.geoLabel( {
				metadata: [
					{ id: '796', key: 'geo_address', value: address }
				]
			} );

			expect( value ).to.equal( address );
		} );
	} );

	describe( '#geoCoordinates()', function() {
		it( 'should return undefined if passed a falsey value', function() {
			const value = PostMetadata.geoCoordinates( undefined );

			expect( value ).to.be.undefined;
		} );

		it( 'should return undefined if metadata not assigned to post', function() {
			const value = PostMetadata.geoCoordinates( {} );

			expect( value ).to.be.undefined;
		} );

		it( 'should return undefined if metadata contains no geolocation coordinate', function() {
			const value = PostMetadata.geoCoordinates( { metadata: [] } );

			expect( value ).to.be.undefined;
		} );

		it( 'should return undefined if metadata contains only one of latitude or longitude', function() {
			const value = PostMetadata.geoCoordinates( {
				metadata: [
					{ id: '796', key: 'geo_latitude', value: '40.7127837' }
				]
			} );

			expect( value ).to.be.undefined;
		} );

		it( 'should return an array of float values if metadata contains coordinate', function() {
			let latitude = 40.7127837,
				longitude = -74.00594130000002,
				value;

			value = PostMetadata.geoCoordinates( {
				metadata: [
					{ id: '796', key: 'geo_latitude', value: latitude.toString() },
					{ id: '796', key: 'geo_longitude', value: longitude.toString() }
				]
			} );

			expect( value ).to.be.eql( [ latitude, longitude ] );
		} );
	} );
} );
