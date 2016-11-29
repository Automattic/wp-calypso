/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isMediaUploadInProgress, getNextQueuedUpload } from '../selectors';

describe( 'selectors', () => {
	describe( 'isMediaUploadInProgress()', () => {
		it( 'should return false if the queue is empty', () => {
			const isUploadInProgress = isMediaUploadInProgress( {
				media: {
					uploadQueue: []
				}
			} );

			expect( isUploadInProgress ).to.be.false;
		} );

		it( 'should return true if the queue is not empty', () => {
			const isUploadInProgress = isMediaUploadInProgress( {
				media: {
					uploadQueue: [ [ 2916284, 'https://wordpress.com/i/stats-icon.gif' ] ]
				}
			} );

			expect( isUploadInProgress ).to.be.true;
		} );
	} );

	describe( 'getNextQueuedUpload()', () => {
		it( 'should return null if there are no queued uploads', () => {
			const nextQueued = getNextQueuedUpload( {
				media: {
					uploadQueue: []
				}
			} );

			expect( nextQueued ).to.be.null;
		} );

		it( 'should return the next queued upload', () => {
			const nextQueued = getNextQueuedUpload( {
				media: {
					uploadQueue: [ [ 2916284, 'https://wordpress.com/i/stats-icon.gif' ] ]
				}
			} );

			expect( nextQueued ).to.eql( {
				siteId: 2916284,
				file: 'https://wordpress.com/i/stats-icon.gif'
			} );
		} );
	} );
} );
