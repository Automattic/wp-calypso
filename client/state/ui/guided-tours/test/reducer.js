/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	GUIDED_TOUR_SHOW,
} from 'state/action-types';
import { guidedTour } from '../reducer';

describe( 'reducer', () => {
	describe( '#guidedTour()', () => {
		it( 'should default to an empty object', () => {
			const state = guidedTour( undefined, {} );

			expect( state ).to.be.empty;
		} );

		it( 'should set a tour to be shown', () => {
			const state = guidedTour( undefined, {
				type: GUIDED_TOUR_SHOW,
				shouldShow: true,
				tour: 'foo',
			} );

			expect( state.shouldShow ).to.be.true;
			expect( state.tour ).to.equal( 'foo' );
		} );
	} );
} );
