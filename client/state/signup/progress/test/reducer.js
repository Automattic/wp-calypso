import {
	SIGNUP_COMPLETE_RESET,
	SIGNUP_PROGRESS_COMPLETE_STEP,
	SIGNUP_PROGRESS_INVALIDATE_STEP,
	SIGNUP_PROGRESS_PROCESS_STEP,
	SIGNUP_PROGRESS_SAVE_STEP,
	SIGNUP_PROGRESS_SUBMIT_STEP,
} from 'calypso/state/action-types';
import reducer from '../reducer';

// Mock necessary for testing certain utils
jest.mock( 'calypso/signup/config/flows-pure', () => ( {
	'new-flow': {
		steps: [ 'something', 'everything' ],
	},
} ) );

// Mock necessary for testing step submission behavior
jest.mock( 'calypso/signup/config/steps-pure', () => ( {
	stepWithAPI: { apiRequestFunction: () => {} },
	stepWithoutAPI: {},
} ) );

describe( 'reducer', () => {
	test( 'should return an empty object at first', () => {
		expect( Object.keys( reducer( undefined, { type: 'init' } ) ) ).toHaveLength( 0 );
	} );

	test( 'should store a new step', () => {
		const initialState = {};
		const action = {
			type: SIGNUP_PROGRESS_SUBMIT_STEP,
			step: {
				stepName: 'site-selection',
				formData: { url: 'my-site.wordpress.com' },
			},
		};
		const finalState = reducer( initialState, action );
		expect( Object.keys( finalState ) ).toHaveLength( 1 );
		expect( finalState[ 'site-selection' ].stepName ).toBe( 'site-selection' );
	} );

	test( 'should not store the same step twice', () => {
		const actions = [
			{
				type: SIGNUP_PROGRESS_SUBMIT_STEP,
				step: {
					stepName: 'site-selection',
					formData: { url: 'my-site.wordpress.com' },
				},
			},
			{
				type: SIGNUP_PROGRESS_SUBMIT_STEP,
				step: {
					stepName: 'site-selection',
				},
			},
		];

		const state = actions.reduce( reducer, [] );

		expect( Object.keys( state ) ).toHaveLength( 1 );
		expect( state[ 'site-selection' ] ).toMatchObject( {
			stepName: 'site-selection',
			formData: { url: 'my-site.wordpress.com' },
			status: 'completed',
		} );
	} );

	test( 'should store multiple steps', () => {
		const actions = [
			{
				type: SIGNUP_PROGRESS_SUBMIT_STEP,
				step: { stepName: 'site-selection' },
			},
			{
				type: SIGNUP_PROGRESS_SUBMIT_STEP,
				step: { stepName: 'select-theme' },
			},
		];

		const state = actions.reduce( reducer, [] );

		expect( Object.keys( state ) ).toHaveLength( 2 );
		expect( state[ 'site-selection' ].stepName ).toBe( 'site-selection' );
		expect( state[ 'select-theme' ].stepName ).toBe( 'select-theme' );
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

		expect( state[ 'site-selection' ].status ).not.toBe( 'in-progress' );
		expect( state[ 'last-step' ].status ).toBe( 'in-progress' );
	} );

	test( 'should set the status of a signup step', () => {
		let state = {};

		state = reducer( state, {
			type: SIGNUP_PROGRESS_SUBMIT_STEP,
			step: { stepName: 'site-selection' },
		} );
		expect( state[ 'site-selection' ].status ).toBe( 'completed' );

		state = reducer( state, {
			type: SIGNUP_PROGRESS_COMPLETE_STEP,
			step: { stepName: 'site-selection' },
		} );
		expect( state[ 'site-selection' ].status ).toBe( 'completed' );
	} );

	describe( 'setting and resetting the state', () => {
		test( 'should handle resetting the state', () => {
			const initialState = { test: { test: 123 } };
			const action = { type: SIGNUP_COMPLETE_RESET };
			const finalState = {};
			expect( reducer( initialState, action ) ).toEqual( finalState );
		} );
	} );

	describe( 'completing a step', () => {
		test( 'should mark the new step with the "completed" status', () => {
			const initialState = { example: { stepName: 'example', status: 'something' } };
			const action = {
				type: SIGNUP_PROGRESS_COMPLETE_STEP,
				step: { stepName: 'example', exampleValue: 'some value' },
			};
			const finalState = {
				example: { stepName: 'example', exampleValue: 'some value', status: 'completed' },
			};
			expect( reducer( initialState, action ) ).toEqual( finalState );
		} );
		test( 'should not add a new step if no steps match by name', () => {
			const initialState = { example: { stepName: 'example', status: 'something' } };
			const action = {
				type: SIGNUP_PROGRESS_COMPLETE_STEP,
				step: { stepName: 'differentName', exampleValue: 'some value' },
			};
			expect( reducer( initialState, action ) ).toEqual( initialState );
		} );
	} );

	describe( 'invalidating a step', () => {
		test( "should add a step with error data and 'invalid' status if the step's name is unique", () => {
			const initialState = { whatever: { stepName: 'whatever' } };
			const action = {
				type: SIGNUP_PROGRESS_INVALIDATE_STEP,
				step: { stepName: 'something' },
				errors: [ new Error( 'something' ) ],
			};
			const finalState = {
				whatever: { stepName: 'whatever' },
				something: {
					stepName: 'something',
					status: 'invalid',
					errors: [ new Error( 'something' ) ],
				},
			};
			expect( reducer( initialState, action ) ).toEqual( finalState );
		} );

		test( "should update a step with error data and 'invalid' status if the step's name is not unique", () => {
			const initialState = {
				something: {
					stepName: 'something',
				},
			};
			const action = {
				type: SIGNUP_PROGRESS_INVALIDATE_STEP,
				step: { stepName: 'something', value: 'example' },
				errors: [ new Error( 'something' ) ],
			};
			const finalState = {
				something: {
					errors: [ new Error( 'something' ) ],
					status: 'invalid',
					stepName: 'something',
					value: 'example',
				},
			};
			expect( reducer( initialState, action ) ).toEqual( finalState );
		} );
	} );

	describe( 'processing a step', () => {
		test( 'should update the step with a "processing" status', () => {
			const initialState = {
				example: {
					stepName: 'example',
					status: 'something',
				},
			};
			const action = {
				type: SIGNUP_PROGRESS_PROCESS_STEP,
				step: { stepName: 'example', exampleValue: 'some value' },
			};
			const finalState = {
				example: { stepName: 'example', exampleValue: 'some value', status: 'processing' },
			};
			expect( reducer( initialState, action ) ).toEqual( finalState );
		} );

		test( 'should not add a new step if no steps match by name', () => {
			const initialState = {
				example: {
					stepName: 'example',
					status: 'something',
				},
			};
			const action = {
				type: SIGNUP_PROGRESS_PROCESS_STEP,
				step: { stepName: 'differentName', exampleValue: 'some value' },
			};
			expect( reducer( initialState, action ) ).toEqual( initialState );
		} );
	} );

	describe( 'saving a step', () => {
		describe( 'saving a new step', () => {
			test( 'should add a new step to the state if step name is unique', () => {
				const initialState = { whatever: { stepName: 'whatever' } };
				const action = {
					type: SIGNUP_PROGRESS_SAVE_STEP,
					step: { stepName: 'something' },
				};
				const state = reducer( initialState, action );
				expect( Object.keys( state ) ).toHaveLength( 2 );
				expect( state.something ).toBeTruthy();
				expect( state.whatever ).toBeTruthy();
			} );
			test( 'should mark the new step with an "in-progress" status', () => {
				const initialState = { whatever: { stepName: 'whatever' } };
				const action = {
					type: SIGNUP_PROGRESS_SAVE_STEP,
					step: { stepName: 'something' },
				};
				const finalState = {
					whatever: { stepName: 'whatever' },
					something: { stepName: 'something', status: 'in-progress' },
				};
				expect( reducer( initialState, action ) ).toEqual( finalState );
			} );
		} );
		describe( 'saving an existing step', () => {
			test( 'should update the existing step with the provided data', () => {
				const initialState = { whatever: { stepName: 'whatever', oldValue: 'example' } };
				const action = {
					type: SIGNUP_PROGRESS_SAVE_STEP,
					step: { stepName: 'whatever', newValue: 'example' },
				};
				const finalState = {
					whatever: { newValue: 'example', oldValue: 'example', stepName: 'whatever' },
				};
				expect( reducer( initialState, action ) ).toEqual( finalState );
			} );
		} );
	} );

	describe( 'submitting a step', () => {
		describe( 'saving a new step', () => {
			test( 'should update the step with a "pending" status if the step has a corresponding API request function', () => {
				const initialState = { 'some-step': { stepName: 'some-step' } };
				const action = {
					type: SIGNUP_PROGRESS_SUBMIT_STEP,
					step: { stepName: 'stepWithAPI', updateValue: 'some value' },
				};
				const finalState = {
					'some-step': { stepName: 'some-step' },
					stepWithAPI: { stepName: 'stepWithAPI', updateValue: 'some value', status: 'pending' },
				};
				expect( reducer( initialState, action ) ).toEqual( finalState );
			} );
			test( 'should update the step with a "completed" status if the step does not have a corresponding API request function', () => {
				const initialState = { 'some-step': { stepName: 'some-step' } };
				const action = {
					type: SIGNUP_PROGRESS_SUBMIT_STEP,
					step: { stepName: 'stepWithoutAPI', updateValue: 'some value' },
				};
				const finalState = {
					'some-step': { stepName: 'some-step' },
					stepWithoutAPI: {
						stepName: 'stepWithoutAPI',
						updateValue: 'some value',
						status: 'completed',
					},
				};
				expect( reducer( initialState, action ) ).toEqual( finalState );
			} );
		} );
		describe( 'saving an existing step', () => {
			test( 'should update the step with a "pending" status if the step has a corresponding API request function', () => {
				// It should also drop the wasSkipped value
				const initialState = {
					stepWithAPI: {
						stepName: 'stepWithAPI',
						wasSkipped: true,
					},
				};
				const action = {
					type: SIGNUP_PROGRESS_SUBMIT_STEP,
					step: {
						stepName: 'stepWithAPI',
						updateValue: 'some value',
					},
				};
				const finalState = {
					stepWithAPI: { stepName: 'stepWithAPI', updateValue: 'some value', status: 'pending' },
				};
				expect( reducer( initialState, action ) ).toEqual( finalState );
			} );
			test( 'should update the step with a "completed" status if the step does not have a corresponding API request function', () => {
				// It should also drop the wasSkipped value
				const initialState = {
					stepWithoutAPI: {
						stepName: 'stepWithoutAPI',
						wasSkipped: true,
					},
				};
				const action = {
					type: SIGNUP_PROGRESS_SUBMIT_STEP,
					step: { stepName: 'stepWithoutAPI', updateValue: 'some value' },
				};
				const finalState = {
					stepWithoutAPI: {
						stepName: 'stepWithoutAPI',
						updateValue: 'some value',
						status: 'completed',
					},
				};
				expect( reducer( initialState, action ) ).toEqual( finalState );
			} );
		} );
	} );
} );
