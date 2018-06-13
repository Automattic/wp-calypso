/** @format */

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import {
	SIGNUP_COMPLETE_RESET,
	SIGNUP_PROGRESS_ADD_OR_UPDATE,
	SIGNUP_PROGRESS_SET,
	SIGNUP_PROGRESS_REMOVE_UNNEEDED_STEPS,
} from 'state/action-types';

describe( 'reducer', () => {
	test( 'should update the state', () => {
		expect(
			reducer( [], {
				type: SIGNUP_PROGRESS_SET,
				steps: [ { test: 123 } ],
			} )
		).toEqual( [ { test: 123 } ] );
	} );

	test( 'should reset the state', () => {
		expect(
			reducer( [ { test: 123 } ], {
				type: SIGNUP_COMPLETE_RESET,
			} )
		).toEqual( [] );
	} );

	describe( 'adding or updating steps', () => {
		test( 'should add a step to the state if it has a unique stepName', () => {
			const initialState = [ { stepName: 'whatever' } ];
			const action = {
				type: SIGNUP_PROGRESS_ADD_OR_UPDATE,
				step: { stepName: 'something' },
			};
			const finalState = [ { stepName: 'whatever' }, { stepName: 'something' } ];
			expect( reducer( initialState, action ) ).toEqual( finalState );
		} );
		test( 'should update a step in the state if it has the same stepName', () => {
			const initialState = [ { stepName: 'something', value: 'great' } ];
			const action = {
				type: SIGNUP_PROGRESS_ADD_OR_UPDATE,
				step: { stepName: 'something', anotherValue: 'also great' },
			};
			const finalState = [ { stepName: 'something', value: 'great', anotherValue: 'also great' } ];
			expect( reducer( initialState, action ) ).toEqual( finalState );
		} );
	} );

	describe( 'removing unneded steps', () => {
		test( 'should remove steps with names not included in the validStepNames array', () => {
			const initialState = [
				{ stepName: 'something', value: 'great something' },
				{ stepName: 'everything', value: 'great everything' },
				{ stepName: 'nothing', value: 'great nothing' },
				{ stepName: 'one', value: 'great one' },
			];
			const action = {
				type: SIGNUP_PROGRESS_REMOVE_UNNEEDED_STEPS,
				validStepNames: [ 'something', 'everything' ],
			};
			const finalState = [
				{ stepName: 'something', value: 'great something' },
				{ stepName: 'everything', value: 'great everything' },
			];
			expect( reducer( initialState, action ) ).toEqual( finalState );
		} );
	} );
} );
