/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import { noop, times } from 'lodash';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import {
	MEDIA_FILE_UPLOAD,
	MEDIA_FILE_UPLOAD_FAILURE,
	MEDIA_FILE_UPLOAD_SUCCESS
} from 'state/action-types';
import { enqueueFileUpload } from '../actions';
import { uploadQueueMiddleware } from '../middleware';

describe( 'middleware', () => {
	describe( 'uploadQueueMiddleware()', () => {
		let state, dispatchWithMiddleware;
		const store = { dispatch: noop, getState: noop };

		useSandbox( ( sandbox ) => {
			sandbox.stub( store, 'dispatch' )
				// When called with thunk, call on thunk with dispatch
				.withArgs( sinon.match.func ).callsArgWith( 0, store.dispatch );
			sandbox.stub( store, 'getState', () => state );
			dispatchWithMiddleware = uploadQueueMiddleware( store )( noop );
		} );

		function stubStateUploadsInProgress( uploads = 0 ) {
			state = {
				media: {
					uploadQueue: times( uploads, () => [ 2916284, 'https://wordpress.com/i/stats-icon.gif' ] )
				}
			};
		}

		beforeEach( stubStateUploadsInProgress );

		it( 'should dispatch upload with first enqueued file if no upload in progress', () => {
			dispatchWithMiddleware( enqueueFileUpload( 77203074, 'https://wordpress.com/i/favicon.ico' ) );

			expect( store.dispatch ).to.have.been.calledWith( {
				type: MEDIA_FILE_UPLOAD,
				siteId: 77203074,
				file: 'https://wordpress.com/i/favicon.ico'
			} );
		} );

		it( 'should not dispatch upload with first enqueued file if upload in progress', () => {
			stubStateUploadsInProgress( 1 );
			dispatchWithMiddleware( enqueueFileUpload( 77203074, 'https://wordpress.com/i/favicon.ico' ) );

			expect( store.dispatch ).to.not.have.been.calledWithMatch( {
				type: MEDIA_FILE_UPLOAD
			} );
		} );

		[ MEDIA_FILE_UPLOAD_FAILURE, MEDIA_FILE_UPLOAD_SUCCESS ].forEach( ( type ) => {
			it( `should dispatch next queued upload after ${ type }`, () => {
				stubStateUploadsInProgress( 1 );
				dispatchWithMiddleware( { type } );

				expect( store.dispatch ).to.have.been.calledWith( {
					type: MEDIA_FILE_UPLOAD,
					siteId: 2916284,
					file: 'https://wordpress.com/i/stats-icon.gif'
				} );
			} );

			it( `should not dispatch after ${ type } if no more in queue`, () => {
				dispatchWithMiddleware( { type } );

				expect( store.dispatch ).to.not.have.been.calledWithMatch( {
					type: MEDIA_FILE_UPLOAD
				} );
			} );
		} );
	} );
} );
