
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getBackPath } from '../selectors';

describe( 'selectors', () => {
	describe( '#getBackPath', () => {
		it( 'should return the back path', () => {
			const state = {
				themes: {
					themesUI: {
						backPath: '/design'
					}
				}
			};
			expect( getBackPath( state ) ).to.eql( '/design' );
		} );
	} );
} );
