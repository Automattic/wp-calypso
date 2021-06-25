/**
 * Internal dependencies
 */
import signupDependencyStore from '../reducer';
import {
	SIGNUP_DEPENDENCY_STORE_UPDATE,
	SIGNUP_PROGRESS_SUBMIT_STEP,
	SIGNUP_PROGRESS_COMPLETE_STEP,
	SIGNUP_COMPLETE_RESET,
} from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( 'should return an empty object at first', () => {
		const state = signupDependencyStore( undefined, { type: 'init' } );
		expect( state ).toEqual( {} );
	} );

	test( 'should not store dependencies if none are included in the action', () => {
		const prevState = {};
		const action = { type: SIGNUP_PROGRESS_SUBMIT_STEP, step: { stepName: 'userCreation' } };
		const nextState = signupDependencyStore( prevState, action );
		expect( nextState ).toBe( prevState );
	} );

	test( 'should store dependencies if they are provided in either signup action', () => {
		let state = {};

		const submitAction = {
			type: SIGNUP_PROGRESS_SUBMIT_STEP,
			step: { stepName: 'userCreation', providedDependencies: { bearer_token: 'TOKEN1' } },
		};
		state = signupDependencyStore( state, submitAction );
		expect( state ).toEqual( { bearer_token: 'TOKEN1' } );

		const completeAction = {
			type: SIGNUP_PROGRESS_COMPLETE_STEP,
			step: { stepName: 'userCreation', providedDependencies: { bearer_token: 'TOKEN2' } },
		};
		state = signupDependencyStore( state, completeAction );
		expect( state ).toEqual( { bearer_token: 'TOKEN2' } );
	} );

	test( 'should add provided dependencies', () => {
		const action = { type: SIGNUP_DEPENDENCY_STORE_UPDATE, dependencies: { new: 456 } };
		const state = signupDependencyStore( { old: 123 }, action );
		expect( state ).toEqual( { old: 123, new: 456 } );
	} );

	test( 'should reset the dependencies', () => {
		const action = { type: SIGNUP_COMPLETE_RESET };
		const state = signupDependencyStore( { test: 123 }, action );
		expect( state ).toEqual( {} );
	} );
} );
