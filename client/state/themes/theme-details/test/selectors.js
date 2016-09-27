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
		const themes = {
			themes: {
				themeDetails: Map( {
					mood: Map( {
						name: 'Mood',
						author: 'Automattic',
						price: '$65'
					} ),
					twentysixteen: Map( {
						name: 'Twenty Sixteen',
						author: 'Automattic',
						price: 'free',
					} ),
				} )
			}
		};

		it( 'should return details for a theme given its ID', () => {
			const details = getThemeDetails( themes, 'mood' );
			expect( details ).to.eql( { name: 'Mood', author: 'Automattic', price: '$65' } );
		} );

		it( 'should format the price as plaintext', () => {
			const mood = getThemeDetails( themes, 'mood' );
			expect( mood.price ).to.equal( '$65' );

			const twentysixteen = getThemeDetails( themes, 'twentysixteen' );
			expect( twentysixteen.price ).to.equal( 'free' );
		} );
	} );
} );
