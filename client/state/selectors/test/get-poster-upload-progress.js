/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getPosterUploadProgress } from 'client/state/selectors';

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
