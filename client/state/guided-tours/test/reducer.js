import { GUIDED_TOUR_UPDATE } from 'calypso/state/action-types';
import { guidedTours } from '../reducer';

describe( 'reducer', () => {
	describe( '#guidedTours()', () => {
		test( 'should default to an empty object', () => {
			const state = guidedTours( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should return expected state', () => {
			const state = guidedTours(
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
