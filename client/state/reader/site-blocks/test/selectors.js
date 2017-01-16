/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isSiteBlocked,
} from '../selectors';

describe( 'selectors', () => {

	describe( '#isSiteBlocked()', () => {
		it( 'should return true if the specified site is blocked', () => {
			const state = {
				reader: {
					siteBlocks: {
						items: {
							123: true,
							124: false
						}
					}
				}
			};
			expect( isSiteBlocked( state, 123 ) ).to.equal( true );
			expect( isSiteBlocked( state, 124 ) ).to.equal( false );
			expect( isSiteBlocked( state, 125 ) ).to.equal( false );
		} );
	} );
} );
