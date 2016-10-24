/**
 * External dependencies
 */
import { expect } from 'chai';
import { Map } from 'immutable';

/**
 * Internal dependencies
 */
import { isRequestingCurrentTheme } from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingCurrentTheme()', () => {
		it( 'should return false if request not in progress', () => {
			const requesting = isRequestingCurrentTheme( {
				themes: {
					currentTheme: Map( {
						requesting: Map( {
							2916284: false,
						} )
					} )
				}
			}, 2916284 );

			expect( requesting ).to.eql( false );
		} );
	} );
} );
