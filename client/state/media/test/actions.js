/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	MEDIA_ITEMS_RECEIVE,
	MEDIA_FILE_UPLOAD,
	MEDIA_FILE_UPLOADS_ENQUEUE
} from 'state/action-types';
import {
	receiveMediaItem,
	receiveMediaItems,
	uploadFile,
	enqueueFileUpload,
	enqueueFileUploads
} from '../actions';

describe( 'actions', () => {
	describe( 'receiveMediaItem()', () => {
		it( 'should return an action object', () => {
			const action = receiveMediaItem( 2916284, { ID: 42, title: 'flower' } );

			expect( action ).to.eql( {
				type: MEDIA_ITEMS_RECEIVE,
				siteId: 2916284,
				items: [ { ID: 42, title: 'flower' } ]
			} );
		} );
	} );

	describe( 'receiveMediaItems()', () => {
		it( 'should return an action object', () => {
			const action = receiveMediaItems( 2916284, [ { ID: 42, title: 'flower' } ] );

			expect( action ).to.eql( {
				type: MEDIA_ITEMS_RECEIVE,
				siteId: 2916284,
				items: [ { ID: 42, title: 'flower' } ]
			} );
		} );
	} );

	describe( 'uploadFile()', () => {
		it( 'should return an action object', () => {
			const action = uploadFile( 2916284, 'https://wordpress.com/i/stats-icon.gif' );

			expect( action ).to.eql( {
				type: MEDIA_FILE_UPLOAD,
				siteId: 2916284,
				file: 'https://wordpress.com/i/stats-icon.gif'
			} );
		} );
	} );

	describe( 'enqueueFileUpload()', () => {
		it( 'should return an action object', () => {
			const action = enqueueFileUpload( 2916284, 'https://wordpress.com/i/stats-icon.gif' );

			expect( action ).to.eql( {
				type: MEDIA_FILE_UPLOADS_ENQUEUE,
				siteId: 2916284,
				files: [ 'https://wordpress.com/i/stats-icon.gif' ]
			} );
		} );
	} );

	describe( 'enqueueFileUploads()', () => {
		it( 'should return an action object', () => {
			const action = enqueueFileUploads( 2916284, [ 'https://wordpress.com/i/stats-icon.gif' ] );

			expect( action ).to.eql( {
				type: MEDIA_FILE_UPLOADS_ENQUEUE,
				siteId: 2916284,
				files: [ 'https://wordpress.com/i/stats-icon.gif' ]
			} );
		} );
	} );
} );
