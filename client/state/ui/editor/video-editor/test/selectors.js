/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getVideoEditorPoster,
	isVideoEditorVideoLoaded,
	isVideoEditorPosterUpdating,
	isVideoEditorPosterUpdated,
	videoEditorHasPosterUpdateError,
	videoEditorHasScriptLoadError,
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getVideoEditorPoster()', () => {
		it( 'should return the current video editor poster', () => {
			const posterUrl = 'https://i1.wp.com/videos.files.wordpress.com/dummy-guid/thumbnail.jpg?ssl=1';
			const poster = getVideoEditorPoster( {
				ui: {
					editor: {
						videoEditor: {
							poster: posterUrl
						}
					}
				}
			} );

			expect( poster ).to.eql( posterUrl );
		} );
	} );

	describe( '#isVideoEditorVideoLoaded()', () => {
		it( 'should return the video loaded state', () => {
			const isVideoLoaded = isVideoEditorVideoLoaded( {
				ui: {
					editor: {
						videoEditor: {
							videoIsLoading: true
						}
					}
				}
			} );

			expect( isVideoLoaded ).to.be.false;
		} );
	} );

	describe( '#isVideoEditorPosterUpdating()', () => {
		it( 'should return the poster updating state', () => {
			const isPosterUpdating = isVideoEditorPosterUpdating( {
				ui: {
					editor: {
						videoEditor: {
							posterIsUpdating: false
						}
					}
				}
			} );

			expect( isPosterUpdating ).to.be.false;
		} );
	} );

	describe( '#isVideoEditorPosterUpdated()', () => {
		it( 'should return the poster updated state', () => {
			const isPosterUpdated = isVideoEditorPosterUpdated( {
				ui: {
					editor: {
						videoEditor: {
							posterIsUpdated: false
						}
					}
				}
			} );

			expect( isPosterUpdated ).to.be.false;
		} );
	} );

	describe( '#videoEditorHasPosterUpdateError()', () => {
		it( 'should return the poster error state', () => {
			const hasPosterUpdateError = videoEditorHasPosterUpdateError( {
				ui: {
					editor: {
						videoEditor: {
							hasPosterUpdateError: true
						}
					}
				}
			} );

			expect( hasPosterUpdateError ).to.be.true;
		} );
	} );

	describe( '#videoEditorHasScriptLoadError()', () => {
		it( 'should return the script load error state', () => {
			const hasScriptLoadError = videoEditorHasScriptLoadError( {
				ui: {
					editor: {
						videoEditor: {
							hasScriptLoadError: false
						}
					}
				}
			} );

			expect( hasScriptLoadError ).to.be.false;
		} );
	} );
} );
