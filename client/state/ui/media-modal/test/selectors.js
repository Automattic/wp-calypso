/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { ModalViews } from '../constants';
import { getMediaModalView } from '../selectors';

describe( 'selectors', () => {
	describe( 'getMediaModalView()', () => {
		it( 'should return the current media modal view', () => {
			const view = getMediaModalView( {
				ui: {
					mediaModal: {
						view: ModalViews.DETAIL
					}
				}
			} );

			expect( view ).to.equal( ModalViews.DETAIL );
		} );
	} );
} );
