/** @format */

/**
 * Internal dependencies
 */
import flows from 'signup/config/flows';
import reducer, { addStep, updateStep } from '../reducer';
import {
	SIGNUP_COMPLETE_RESET,
	SIGNUP_PROGRESS_COMPLETE_STEP,
	SIGNUP_PROGRESS_INVALIDATE_STEP,
	SIGNUP_PROGRESS_PROCESS_STEP,
	SIGNUP_PROGRESS_REMOVE_UNNEEDED_STEPS,
	SIGNUP_PROGRESS_SET,
	SIGNUP_PROGRESS_SAVE_STEP,
	SIGNUP_PROGRESS_SUBMIT_STEP,
} from 'state/action-types';

//
// Mocks necessary to properly handle 'signup/config/steps' import
//
jest.mock( 'lib/abtest', () => ( { abtest: () => '' } ) );
jest.mock( 'lib/signup/step-actions', () => ( { createAccount: () => {} } ) );
jest.mock( 'lib/user', () => () => {
	return {
		get() {
			return {};
		},
	};
} );

//
// Mock necessary to properly handle 'signup/config/flows' import
//
jest.mock( 'signup/config/flows', () => ( {
	getFlow: jest.fn(),
} ) );

//
// Mock necessary for testing step submission behavior
//
jest.mock( 'signup/config/steps', () => ( {
	stepWithAPI: { apiRequestFunction: () => {} },
	stepWithoutAPI: {},
} ) );

describe( 'reducer', () => {
	describe( 'setting and resetting the state', () => {
		test( 'should handle manually setting the state', () => {
			const initialState = [];
			const action = {
				type: SIGNUP_PROGRESS_SET,
				steps: [ { test: 123 } ],
			};
			const finalState = [ { test: 123 } ];
			expect( reducer( initialState, action ) ).toEqual( finalState );
		} );
		test( 'should handle resetting the state', () => {
			const initialState = [ { test: 123 } ];
			const action = {
				type: SIGNUP_COMPLETE_RESET,
			};
			const finalState = [];
			expect( reducer( initialState, action ) ).toEqual( finalState );
		} );
	} );

	describe( 'adding a step', () => {
		test( 'should add a new step', () => {
			const initialState = [ { stepName: 'aloha' } ];
			const finalState = addStep( initialState, { stepName: 'hello' } );
			const expectedFinalState = [ { stepName: 'aloha' }, { stepName: 'hello' } ];
			expect( finalState ).toEqual( expectedFinalState );
		} );
	} );

	describe( 'updating a step', () => {
		test( 'should update an existing step if it has the same name', () => {
			const initialState = [ { stepName: 'aloha', exampleValue1: 'message' } ];
			const finalState = updateStep( initialState, {
				stepName: 'aloha',
				exampleValue2: 'lol',
			} );
			const expectedFinalState = [
				{ stepName: 'aloha', exampleValue1: 'message', exampleValue2: 'lol' },
			];
			expect( finalState ).toEqual( expectedFinalState );
		} );
		test( 'should not add a new step if no steps match by name', () => {
			const initialState = [ { stepName: 'aloha', exampleValue1: 'message' } ];
			const finalState = updateStep( initialState, {
				stepName: 'no match',
				exampleValue2: 'lol',
			} );
			const expectedFinalState = [ { stepName: 'aloha', exampleValue1: 'message' } ];
			expect( finalState ).toEqual( expectedFinalState );
		} );
		test( 'should omit "processingMessage" and "wasSkipped" values when updating "pending" steps', () => {
			const initialState = [
				{
					stepName: 'aloha',
					processingMessage: 'something',
					wasSkipped: true,
				},
			];
			const finalState = updateStep( initialState, {
				exampleValue: 'example',
				status: 'pending',
				stepName: 'aloha',
			} );
			const expectedFinalState = [
				{ stepName: 'aloha', status: 'pending', exampleValue: 'example' },
			];
			expect( finalState ).toEqual( expectedFinalState );
		} );
		test( 'should omit "processingMessage" and "wasSkipped" values when updating "completed" steps', () => {
			const initialState = [
				{
					stepName: 'aloha',
					processingMessage: 'something',
					wasSkipped: true,
				},
			];
			const finalState = updateStep( initialState, {
				exampleValue: 'example',
				status: 'completed',
				stepName: 'aloha',
			} );
			const expectedFinalState = [
				{ stepName: 'aloha', status: 'completed', exampleValue: 'example' },
			];
			expect( finalState ).toEqual( expectedFinalState );
		} );
	} );

	describe( 'completing a step', () => {
		test( 'should mark the new step with the "completed" status', () => {
			const initialState = [ { stepName: 'example', status: 'something' } ];
			const action = {
				type: SIGNUP_PROGRESS_COMPLETE_STEP,
				step: { stepName: 'example', exampleValue: 'some value' },
			};
			const finalState = [
				{ stepName: 'example', exampleValue: 'some value', status: 'completed' },
			];
			expect( reducer( initialState, action ) ).toEqual( finalState );
		} );
	} );

	describe( 'invalidating a step', () => {
		test( "should append a step with error data and 'invalid' status if the step's name is unique", () => {
			const initialState = [ { stepName: 'whatever' } ];
			const action = {
				type: SIGNUP_PROGRESS_INVALIDATE_STEP,
				step: { stepName: 'something' },
				errors: [ new Error( 'something' ) ],
			};
			const finalState = [
				{ stepName: 'whatever' },
				{ stepName: 'something', status: 'invalid', errors: [ new Error( 'something' ) ] },
			];
			expect( reducer( initialState, action ) ).toEqual( finalState );
		} );

		test( "should update a step with error data and 'invalid' status if the step's name is not unique", () => {
			const initialState = [ { stepName: 'something' } ];
			const action = {
				type: SIGNUP_PROGRESS_INVALIDATE_STEP,
				step: { stepName: 'something', value: 'example' },
				errors: [ new Error( 'something' ) ],
			};
			const finalState = [
				{
					errors: [ new Error( 'something' ) ],
					status: 'invalid',
					stepName: 'something',
					value: 'example',
				},
			];
			expect( reducer( initialState, action ) ).toEqual( finalState );
		} );
	} );

	describe( 'processing a step', () => {
		test( 'should update the step with a "processing" status', () => {
			const initialState = [ { stepName: 'example', status: 'something' } ];
			const action = {
				type: SIGNUP_PROGRESS_PROCESS_STEP,
				step: { stepName: 'example', exampleValue: 'some value' },
			};
			const finalState = [
				{ stepName: 'example', exampleValue: 'some value', status: 'processing' },
			];
			expect( reducer( initialState, action ) ).toEqual( finalState );
		} );
	} );

	describe( 'removing unneded steps', () => {
		test( 'should remove steps with names not included in the validStepNames array', () => {
			flows.getFlow.mockReturnValueOnce( { steps: [ 'something', 'everything' ] } );

			const initialState = [
				{ stepName: 'something', value: 'great something' },
				{ stepName: 'everything', value: 'great everything' },
				{ stepName: 'nothing', value: 'great nothing' },
				{ stepName: 'one', value: 'great one' },
			];
			const action = {
				type: SIGNUP_PROGRESS_REMOVE_UNNEEDED_STEPS,
				flowName: 'new-flow',
			};
			const finalState = [
				{ stepName: 'something', value: 'great something' },
				{ stepName: 'everything', value: 'great everything' },
			];
			expect( reducer( initialState, action ) ).toEqual( finalState );
		} );
	} );

	describe( 'saving a step', () => {
		describe( 'saving a new step', () => {
			test( 'should append a new step to the state if step name is unique', () => {
				const initialState = [ { stepName: 'whatever' } ];
				const action = {
					type: SIGNUP_PROGRESS_SAVE_STEP,
					step: { stepName: 'something' },
				};
				const state = reducer( initialState, action );
				expect( state ).toHaveLength( 2 );
				expect( state[ 1 ].stepName ).toEqual( 'something' );
			} );
			test( 'should mark the new step with an "in-progress" status', () => {
				const initialState = [ { stepName: 'whatever' } ];
				const action = {
					type: SIGNUP_PROGRESS_SAVE_STEP,
					step: { stepName: 'something' },
				};
				const finalState = [
					{ stepName: 'whatever' },
					{ stepName: 'something', status: 'in-progress' },
				];
				expect( reducer( initialState, action ) ).toEqual( finalState );
			} );
		} );
		describe( 'saving an existing step', () => {
			test( 'should update the existing step with the provided data', () => {
				const initialState = [ { stepName: 'whatever', oldValue: 'example' } ];
				const action = {
					type: SIGNUP_PROGRESS_SAVE_STEP,
					step: { stepName: 'whatever', newValue: 'example' },
				};
				const finalState = [ { newValue: 'example', oldValue: 'example', stepName: 'whatever' } ];
				expect( reducer( initialState, action ) ).toEqual( finalState );
			} );
		} );
	} );

	describe( 'submitting a step', () => {
		describe( 'saving a new step', () => {
			test( 'should update the step with a "pending" status if the step has a corresponding API request function', () => {
				const initialState = [ { stepName: 'some-step' } ];
				const action = {
					type: SIGNUP_PROGRESS_SUBMIT_STEP,
					step: { stepName: 'stepWithAPI', updateValue: 'some value' },
				};
				const finalState = [
					{ stepName: 'some-step' },
					{ stepName: 'stepWithAPI', updateValue: 'some value', status: 'pending' },
				];
				expect( reducer( initialState, action ) ).toEqual( finalState );
			} );
			test( 'should update the step with a "completed" status if the step does not have a corresponding API request function', () => {
				const initialState = [ { stepName: 'some-step' } ];
				const action = {
					type: SIGNUP_PROGRESS_SUBMIT_STEP,
					step: { stepName: 'stepWithoutAPI', updateValue: 'some value' },
				};
				const finalState = [
					{ stepName: 'some-step' },
					{ stepName: 'stepWithoutAPI', updateValue: 'some value', status: 'completed' },
				];
				expect( reducer( initialState, action ) ).toEqual( finalState );
			} );
		} );
		describe( 'saving an existing step', () => {
			test( 'should update the step with a "pending" status if the step has a corresponding API request function', () => {
				const initialState = [ { stepName: 'stepWithAPI' } ];
				const action = {
					type: SIGNUP_PROGRESS_SUBMIT_STEP,
					step: { stepName: 'stepWithAPI', updateValue: 'some value' },
				};
				const finalState = [
					{ stepName: 'stepWithAPI', updateValue: 'some value', status: 'pending' },
				];
				expect( reducer( initialState, action ) ).toEqual( finalState );
			} );
			test( 'should update the step with a "completed" status if the step does not have a corresponding API request function', () => {
				const initialState = [ { stepName: 'stepWithoutAPI' } ];
				const action = {
					type: SIGNUP_PROGRESS_SUBMIT_STEP,
					step: { stepName: 'stepWithoutAPI', updateValue: 'some value' },
				};
				const finalState = [
					{ stepName: 'stepWithoutAPI', updateValue: 'some value', status: 'completed' },
				];
				expect( reducer( initialState, action ) ).toEqual( finalState );
			} );
		} );
	} );
} );
