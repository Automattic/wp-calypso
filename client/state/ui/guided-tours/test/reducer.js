/**
 * Internal dependencies
 */
import { guidedTour } from '../reducer';
import { GUIDED_TOUR_UPDATE } from 'state/action-types';

describe( 'reducer', () => {
	describe( '#guidedTour()', () => {
		test( 'should default to an empty object', () => {
			const state = guidedTour( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should return expected state', () => {
			const state = guidedTour(
				{},
				{
					type: GUIDED_TOUR_UPDATE,
					tour: 'testTour',
					stepName: 'testStepName',
					isPaused: false,
				}
			);
			expect( state ).toEqual( {
				tour: 'testTour',
				stepName: 'testStepName',
				isPaused: false,
			} );
		} );
	} );
} );
