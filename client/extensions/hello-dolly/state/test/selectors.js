/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { translate } from 'i18n-calypso';
import { getCurrentLyric } from '../selectors';

describe( 'selectors', () => {
	describe( '#getCurrentLyric', () => {
		const threeLines = [ 'one', 'two', 'three' ];
		const dollyState = ( state ) => ( { extensions: { helloDolly: state } } );

		it( 'should return the first line if no state exists', () => {
			expect( getCurrentLyric( threeLines )( dollyState( undefined ) ) ).to.equal( 'one' );
		} );

		it( 'should wrap-around in the list if given out-of-bounds indices', () => {
			expect( getCurrentLyric( threeLines )( dollyState( 2 ) ) ).to.equal( 'three' );
			expect( getCurrentLyric( threeLines )( dollyState( 3 ) ) ).to.equal( 'one' );
			expect( getCurrentLyric( threeLines )( dollyState( 4 ) ) ).to.equal( 'two' );
		} );

		it( 'should handle an empty lyrics array', () => {
			expect( getCurrentLyric( [] )( dollyState( 8 ) ) ).to.equal(
				translate( 'I can\'t think of a song to sing.' )
			);
		} );
	} );
} );

