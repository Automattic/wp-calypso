/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isSiteBlocked } from '../';

describe( 'isSiteBlocked()', () => {
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
		expect( isSiteBlocked( state, 123 ) ).to.be.true;
		expect( isSiteBlocked( state, 124 ) ).to.be.false;
		expect( isSiteBlocked( state, 125 ) ).to.be.false;
	} );
} );
