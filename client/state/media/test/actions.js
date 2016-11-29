/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	MEDIA_ITEMS_RECEIVE,
	MEDIA_FILE_UPLOAD,
	MEDIA_FILE_UPLOAD_FAILURE,
	MEDIA_FILE_UPLOAD_SUCCESS,
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
		let dispatch;
		useSandbox( ( sandbox ) => dispatch = sandbox.spy() );

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/media/new', {
					media_urls: [ 'https://wordpress.com/i/stats-icon.gif' ]
				} )
				.reply( 200, {
					media: [ {
						ID: 48,
						file: 'stats-icon.gif'
					} ]
				} )
				.post( '/rest/v1.1/sites/87654321/media/new' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.'
				} );
		} );

		it( 'should dispatch upload action when thunk triggered', () => {
			uploadFile( 2916284, 'https://wordpress.com/i/stats-icon.gif' )( dispatch );

			expect( dispatch ).to.have.been.calledWith( {
				type: MEDIA_FILE_UPLOAD,
				siteId: 2916284,
				file: 'https://wordpress.com/i/stats-icon.gif'
			} );
		} );

		it( 'should dispatch on successful URL upload', () => {
			const file = 'https://wordpress.com/i/stats-icon.gif';

			return uploadFile( 2916284, file )( dispatch ).then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: MEDIA_ITEMS_RECEIVE,
					siteId: 2916284,
					items: [ {
						ID: 48,
						file: 'stats-icon.gif'
					} ]
				} );

				expect( dispatch ).to.have.been.calledWith( {
					type: MEDIA_FILE_UPLOAD_SUCCESS,
					siteId: 2916284,
					file: 'https://wordpress.com/i/stats-icon.gif'
				} );
			} );
		} );

		it.skip( 'should dispatch on successful file object upload', () => {
			// [TODO]: File object upload testing
		} );

		it( 'should dispatch upload failure action when upload fails', () => {
			return uploadFile( 87654321, 'https://wordpress.com/i/stats-icon.gif' )( dispatch ).then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: MEDIA_FILE_UPLOAD_FAILURE,
					siteId: 87654321,
					file: 'https://wordpress.com/i/stats-icon.gif'
				} );
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
