/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import { noop, times } from 'lodash';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	MEDIA_FILE_UPLOAD,
	MEDIA_FILE_UPLOAD_FAILURE,
	MEDIA_FILE_UPLOAD_SUCCESS,
	MEDIA_ITEMS_RECEIVE
} from 'state/action-types';
import { uploadFile, enqueueFileUpload } from 'state/media/actions';
import { requestFileUpload, uploadNext, maybeUploadFirst } from '../';

describe( 'handler', () => {
	let state;
	const store = { dispatch: noop, getState: noop };

	useSandbox( ( sandbox ) => {
		sandbox.stub( store, 'dispatch' )
			// When called with thunk, call on thunk with dispatch
			.withArgs( sinon.match.func ).callsArgWith( 0, store.dispatch );
		sandbox.stub( store, 'getState', () => state );
	} );

	function stubStateUploadsInProgress( uploads = 0 ) {
		state = {
			media: {
				uploadQueue: times( uploads, () => [ 2916284, 'https://wordpress.com/i/stats-icon.gif' ] )
			}
		};
	}

	beforeEach( stubStateUploadsInProgress );

	describe( 'requestFileUpload()', () => {
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

		it( 'should dispatch on successful URL upload', () => {
			const file = 'https://wordpress.com/i/stats-icon.gif';

			return requestFileUpload( store, uploadFile( 2916284, file ) ).then( () => {
				expect( store.dispatch ).to.have.been.calledWith( {
					type: MEDIA_ITEMS_RECEIVE,
					siteId: 2916284,
					items: [ {
						ID: 48,
						file: 'stats-icon.gif'
					} ]
				} );

				expect( store.dispatch ).to.have.been.calledWith( {
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
			return requestFileUpload( store, uploadFile( 87654321, 'https://wordpress.com/i/stats-icon.gif' ) ).then( () => {
				expect( store.dispatch ).to.have.been.calledWith( {
					type: MEDIA_FILE_UPLOAD_FAILURE,
					siteId: 87654321,
					file: 'https://wordpress.com/i/stats-icon.gif'
				} );
			} );
		} );
	} );

	describe( 'uploadNext()', () => {
		[ MEDIA_FILE_UPLOAD_FAILURE, MEDIA_FILE_UPLOAD_SUCCESS ].forEach( ( type ) => {
			it( `should dispatch next queued upload after ${ type }`, () => {
				stubStateUploadsInProgress( 1 );
				uploadNext( store, { type } );

				expect( store.dispatch ).to.have.been.calledWith( {
					type: MEDIA_FILE_UPLOAD,
					siteId: 2916284,
					file: 'https://wordpress.com/i/stats-icon.gif'
				} );
			} );

			it( `should not dispatch after ${ type } if no more in queue`, () => {
				uploadNext( store, { type } );

				expect( store.dispatch ).to.not.have.been.calledWithMatch( {
					type: MEDIA_FILE_UPLOAD
				} );
			} );
		} );
	} );

	describe( 'maybeUploadFirst()', () => {
		it( 'should dispatch upload with first enqueued file if no upload in progress', () => {
			maybeUploadFirst( store, enqueueFileUpload( 77203074, 'https://wordpress.com/i/favicon.ico' ) );

			expect( store.dispatch ).to.have.been.calledWith( {
				type: MEDIA_FILE_UPLOAD,
				siteId: 77203074,
				file: 'https://wordpress.com/i/favicon.ico'
			} );
		} );

		it( 'should not dispatch upload with first enqueued file if upload in progress', () => {
			stubStateUploadsInProgress( 1 );
			maybeUploadFirst( store, enqueueFileUpload( 77203074, 'https://wordpress.com/i/favicon.ico' ) );

			expect( store.dispatch ).to.not.have.been.calledWithMatch( {
				type: MEDIA_FILE_UPLOAD
			} );
		} );
	} );
} );
