/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	MEDIA_ITEMS_RECEIVE,
	MEDIA_FILE_UPLOAD,
	MEDIA_FILE_UPLOAD_FAILURE,
	MEDIA_FILE_UPLOAD_SUCCESS,
	MEDIA_FILE_UPLOADS_ENQUEUE
} from 'state/action-types';
import reducer, { uploadQueue, items } from '../reducer';

describe( 'reducer', () => {
	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'uploadQueue',
			'items'
		] );
	} );

	describe( 'uploadQueue()', () => {
		it( 'should default to an empty array', () => {
			const state = uploadQueue( undefined, {} );

			expect( state ).to.eql( [] );
		} );

		it( 'should append newly enqueued files', () => {
			const originalState = deepFreeze( [] );
			const state = uploadQueue( originalState, {
				type: MEDIA_FILE_UPLOADS_ENQUEUE,
				siteId: 2916284,
				files: [ 'https://wordpress.com/i/stats-icon.gif' ]
			} );

			expect( state ).to.eql( [ [ 2916284, 'https://wordpress.com/i/stats-icon.gif' ] ] );
		} );

		it( 'should remove a file after it has successfully uploaded', () => {
			const originalState = deepFreeze( [ [ 2916284, 'https://wordpress.com/i/stats-icon.gif' ] ] );
			const state = uploadQueue( originalState, {
				type: MEDIA_FILE_UPLOAD_SUCCESS,
				siteId: 2916284,
				file: 'https://wordpress.com/i/stats-icon.gif'
			} );

			expect( state ).to.eql( [] );
		} );

		it( 'should remove a file after it has failed to upload', () => {
			const originalState = deepFreeze( [ [ 2916284, 'https://wordpress.com/i/stats-icon.gif' ] ] );
			const state = uploadQueue( originalState, {
				type: MEDIA_FILE_UPLOAD_FAILURE,
				siteId: 2916284,
				file: 'https://wordpress.com/i/stats-icon.gif'
			} );

			expect( state ).to.eql( [] );
		} );
	} );

	describe( 'items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track items received keyed by site ID, item ID', () => {
			const originalState = deepFreeze( {} );
			const state = items( originalState, {
				type: MEDIA_ITEMS_RECEIVE,
				siteId: 2916284,
				items: [ { ID: 42, title: 'flower' } ]
			} );

			expect( state ).to.eql( {
				2916284: {
					42: { ID: 42, title: 'flower' }
				}
			} );
		} );

		it( 'should track items uploaded keyed by site ID, transient item ID', () => {
			const originalState = deepFreeze( {} );
			const state = items( originalState, {
				type: MEDIA_FILE_UPLOAD,
				siteId: 2916284,
				file: 'https://wordpress.com/i/stats-icon.gif'
			} );

			const keys = Object.keys( state[ 2916284 ] );
			expect( keys ).to.have.lengthOf( 1 );
			expect( keys[ 0 ] ).to.match( /^media\d+$/ );
			expect( state[ 2916284 ][ keys[ 0 ] ].ID ).to.equal( keys[ 0 ] );
			expect( state[ 2916284 ][ keys[ 0 ] ].mime_type ).to.equal( 'image/gif' );
		} );

		it( 'should track files enqueued for upload keyed by site ID, transient item ID', () => {
			const originalState = deepFreeze( {} );
			const state = items( originalState, {
				type: MEDIA_FILE_UPLOADS_ENQUEUE,
				siteId: 2916284,
				files: [
					'https://wordpress.com/i/stats-icon.gif',
					'https://wordpress.com/i/favicon.ico'
				]
			} );

			const keys = Object.keys( state[ 2916284 ] );
			expect( keys ).to.have.lengthOf( 2 );
			keys.forEach( ( key ) => {
				expect( key ).to.match( /^media\d+$/ );
				expect( state[ 2916284 ][ key ].ID ).to.equal( key );
			} );
		} );
	} );
} );
