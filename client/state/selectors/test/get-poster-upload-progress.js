/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getPosterUploadProgress from 'state/selectors/get-poster-upload-progress';

describe( 'getPosterUploadProgress()', () => {
	test( 'should return the upload progress', () => {
		const percentage = 50;
		const uploadProgress = getPosterUploadProgress( {
			ui: {
				editor: {
					videoEditor: {
						uploadProgress: percentage,
					},
				},
			},
		} );

		expect( uploadProgress ).to.eql( percentage );
	} );
} );
