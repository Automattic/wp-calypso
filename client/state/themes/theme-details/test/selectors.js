/**
 * External dependencies
 */
import { expect } from 'chai';
import { Map } from 'immutable';

/**
 * Internal dependencies
 */
import { getThemeDetails } from '../selectors';

describe( 'selectors', () => {
	describe( '#getThemeDetails()', () => {
		it( 'should return details for a theme given its ID', () => {
			const details = getThemeDetails( {
				themes: {
					themeDetails: Map( {
						mood: Map( {
							name: 'Mood',
							author: 'Automattic'
						} )
					} )
				}
			}, 'mood' );

			expect( details ).to.eql( { name: 'Mood', author: 'Automattic' } );
		} );
	} );
} );
