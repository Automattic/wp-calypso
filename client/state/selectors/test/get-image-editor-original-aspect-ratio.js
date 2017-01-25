/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getImageEditorOriginalAspectRatio } from '../';

describe( 'getImageEditorOriginalAspectRatio()', () => {
	it( 'should return null if the image has not loaded yet', () => {
		const originalAspectRatio = getImageEditorOriginalAspectRatio( {
			ui: {
				editor: {
					imageEditor: {
						originalAspectRatio: null
					}
				}
			}
		} );

		expect( originalAspectRatio ).to.equal( null );
	} );

	it( 'should return the original aspect ratio', () => {
		const originalAspectRatio = getImageEditorOriginalAspectRatio( {
			ui: {
				editor: {
					imageEditor: {
						originalAspectRatio: { width: 100, height: 200 }
					}
				}
			}
		} );

		expect( originalAspectRatio ).to.eql( { width: 100, height: 200 } );
	} );
} );
