/** @format */

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import {
	SIGNUP_COMPLETE_RESET,
	SIGNUP_PROGRESS_COMPLETE_STEP,
	SIGNUP_PROGRESS_INVALIDATE_STEP,
	SIGNUP_PROGRESS_PROCESS_STEP,
	SIGNUP_PROGRESS_REMOVE_UNNEEDED_STEPS,
	SIGNUP_PROGRESS_SAVE_STEP,
	SIGNUP_PROGRESS_SUBMIT_STEP,
} from 'state/action-types';

// Mock necessary for testing removeUnneededSteps
jest.mock( 'signup/config/flows-pure', () => ( {
	'new-flow': {
		steps: [ 'something', 'everything' ],
	},
} ) );

// Mock necessary for testing step submission behavior
jest.mock( 'signup/config/steps-pure', () => ( {
	stepWithAPI: { apiRequestFunction: () => {} },
	stepWithoutAPI: {},
} ) );

describe( 'reducer', () => {
	test( 'should return an empty at first', () => {
		expect( reducer( undefined, { type: 'init' } ) ).toHaveLength( 0 );
	} );

	test( 'should store a new step', () => {
		const initialState = [];
		const action = {
			type: SIGNUP_PROGRESS_SUBMIT_STEP,
			step: {
				stepName: 'site-selection',
				formData: { url: 'my-site.wordpress.com' },
			},
		};
		const finalState = reducer( initialState, action );
		expect( finalState ).toHaveLength( 1 );
		expect( finalState[ 0 ].stepName ).toBe( 'site-selection' );
	} );

	test( 'should not store the same step twice', () => {
		let state = [];

		state = reducer( state, {
			type: SIGNUP_PROGRESS_SUBMIT_STEP,
			step: {
				stepName: 'site-selection',
				formData: { url: 'my-site.wordpress.com' },
			},
		} );

		state = reducer( state, {
			type: SIGNUP_PROGRESS_SUBMIT_STEP,
			step: {
				stepName: 'site-selection',
			},
		} );

		expect( state ).toHaveLength( 1 );
		expect( state[ 0 ] ).toMatchObject( {
			stepName: 'site-selection',
			formData: { url: 'my-site.wordpress.com' },
			status: 'completed',
		} );
	} );

	test( 'should store multiple steps in order', () => {
		let state = [];

		state = reducer( state, {
			type: SIGNUP_PROGRESS_SUBMIT_STEP,
			step: { stepName: 'site-selection' },
		} );

		state = reducer( state, {
			type: SIGNUP_PROGRESS_SUBMIT_STEP,
			step: { stepName: 'theme-selection' },
		} );

		expect( state ).toHaveLength( 2 );
		expect( state[ 0 ].stepName ).toBe( 'site-selection' );
		expect( state[ 1 ].stepName ).toBe( 'theme-selection' );
	} );

	test( 'should mark only new saved steps as in-progress', () => {
		const actions = [
			{
				type: SIGNUP_PROGRESS_SUBMIT_STEP,
				step: { stepName: 'site-selection' },
			},

			{
				type: SIGNUP_PROGRESS_SAVE_STEP,
				step: { stepName: 'site-selection' },
			},

			{
				type: SIGNUP_PROGRESS_SAVE_STEP,
				step: { stepName: 'last-step' },
			},
		];

		const state = actions.reduce( reducer, [] );

		expect( state[ 0 ].status ).not.toBe( 'in-progress' );
		expect( state[ 1 ].status ).toBe( 'in-progress' );
	} );

	test( 'should set the status of a signup step', () => {
		let state = [];

		state = reducer( state, {
			type: SIGNUP_PROGRESS_SUBMIT_STEP,
			step: { stepName: 'site-selection' },
		} );
		expect( state[ 0 ].status ).toBe( 'completed' );

		state = reducer( state, {
			type: SIGNUP_PROGRESS_COMPLETE_STEP,
			step: { stepName: 'site-selection' },
		} );
		expect( state[ 0 ].status ).toBe( 'completed' );
	} );

	describe( 'setting and resetting the state', () => {
		test( 'should handle resetting the state', () => {
			const initialState = [ { test: 123 } ];
			const action = { type: SIGNUP_COMPLETE_RESET };
			const finalState = [];
			expect( reducer( initialState, action ) ).toEqual( finalState );
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
		test( 'should not add a new step if no steps match by name', () => {
			const initialState = [ { stepName: 'example', status: 'something' } ];
			const action = {
				type: SIGNUP_PROGRESS_COMPLETE_STEP,
				step: { stepName: 'differentName', exampleValue: 'some value' },
			};
			expect( reducer( initialState, action ) ).toEqual( initialState );
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

		test( 'should not add a new step if no steps match by name', () => {
			const initialState = [ { stepName: 'example', status: 'something' } ];
			const action = {
				type: SIGNUP_PROGRESS_PROCESS_STEP,
				step: { stepName: 'differentName', exampleValue: 'some value' },
			};
			expect( reducer( initialState, action ) ).toEqual( initialState );
		} );
	} );

	describe( 'removing unneded steps', () => {
		test( 'should remove steps that are not in the new flow', () => {
			const initialState = [
				{ stepName: 'something', value: 'great something' },
				{ stepName: 'everything', value: 'great everything' },
				{ stepName: 'nothing', value: 'great nothing' },
				{ stepName: 'one', value: 'great one' },
			];

			const action = { type: SIGNUP_PROGRESS_REMOVE_UNNEEDED_STEPS, flowName: 'new-flow' };

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
				// It should also drop the wasSkipped value
				const initialState = [
					{
						stepName: 'stepWithAPI',
						wasSkipped: true,
					},
				];
				const action = {
					type: SIGNUP_PROGRESS_SUBMIT_STEP,
					step: {
						stepName: 'stepWithAPI',
						updateValue: 'some value',
					},
				};
				const finalState = [
					{ stepName: 'stepWithAPI', updateValue: 'some value', status: 'pending' },
				];
				expect( reducer( initialState, action ) ).toEqual( finalState );
			} );
			test( 'should update the step with a "completed" status if the step does not have a corresponding API request function', () => {
				// It should also drop the wasSkipped value
				const initialState = [
					{
						stepName: 'stepWithoutAPI',
						wasSkipped: true,
					},
				];
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
