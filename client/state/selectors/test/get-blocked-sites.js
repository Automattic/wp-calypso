/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getBlockedSites } from '../';

describe( 'getBlockedSites()', () => {
	it( 'should return an array of blocked site IDs', () => {
		const state = {
			reader: {
				siteBlocks: {
					items: {
						123: true,
						124: false,
						125: true,
					},
				},
			},
		};
		expect( getBlockedSites( state ) ).to.deep.equal( [ 123, 125 ] );
	} );
} );
