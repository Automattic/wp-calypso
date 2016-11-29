/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingTagImages
} from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingTagImages()', () => {
		it( 'should return true if requesting images for the specified tag', () => {
			const state = {
				reader: {
					tags: {
						images: {
							requesting: {
								banana: true,
								feijoa: false
							}
						}
					}
				}
			};
			expect( isRequestingTagImages( state, 'banana' ) ).to.equal( true );
			expect( isRequestingTagImages( state, 'feijoa' ) ).to.equal( false );
			expect( isRequestingTagImages( state, 'unknown' ) ).to.equal( false );
		} );
	} );
} );
