/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getPosterUploadProgress,
	getPosterUrl,
	hasPosterUpdateError,
	isPosterUpdated,
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getPosterUrl()', () => {
		it( 'should return the current video editor poster', () => {
			const posterUrl = 'https://i1.wp.com/videos.files.wordpress.com/dummy-guid/thumbnail.jpg?ssl=1';
			const poster = getPosterUrl( {
				ui: {
					editor: {
						videoEditor: {
							posterUrl
						}
					}
				}
			} );

			expect( poster ).to.eql( posterUrl );
		} );
	} );

	describe( '#getPosterUploadProgress()', () => {
		it( 'should return the upload progress', () => {
			const percentage = 50;
			const uploadProgress = getPosterUploadProgress( {
				ui: {
					editor: {
						videoEditor: {
							uploadProgress: percentage
						}
					}
				}
			} );

			expect( uploadProgress ).to.eql( percentage );
		} );
	} );

	describe( '#isPosterUpdated()', () => {
		it( 'should return the poster updated state', () => {
			const isUpdated = isPosterUpdated( {
				ui: {
					editor: {
						videoEditor: {
							isPosterUpdated: false
						}
					}
				}
			} );

			expect( isUpdated ).to.be.false;
		} );
	} );

	describe( '#hasPosterUpdateError()', () => {
		it( 'should return the poster error state', () => {
			const hasError = hasPosterUpdateError( {
				ui: {
					editor: {
						videoEditor: {
							hasPosterUpdateError: true
						}
					}
				}
			} );

			expect( hasError ).to.be.true;
		} );
	} );
} );
