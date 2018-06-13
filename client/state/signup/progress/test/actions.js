/** @format */

/**
 * Internal dependencies
 */
import flows from 'signup/config/flows';
import { SIGNUP_PROGRESS_ADD_OR_UPDATE } from 'state/action-types';
import {
	completeStep,
	processStep,
	setStepInvalid,
	submitStep,
	removeUnneededSteps,
} from '../actions';

//
// Mocks necessary to properly handle 'signup/config/steps' import
//
jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );
jest.mock( 'lib/signup/step-actions', () => ( {
	createAccount: () => {},
} ) );
jest.mock( 'lib/user', () => () => {
	return {
		get() {
			return {};
		},
	};
} );
jest.mock( 'signup/config/flows', () => ( {
	getFlow: jest.fn(),
} ) );

describe( 'actions', () => {
	let step;
	beforeAll( () => {
		step = { test: 123 };
	} );

	describe( 'completeStep', () => {
		let action;
		beforeAll( () => {
			action = completeStep( step );
		} );

		test( 'dispatches an addOrUpdateStep action', () => {
			expect( action.type ).toEqual( SIGNUP_PROGRESS_ADD_OR_UPDATE );
		} );
		test( 'dispatches an action with a completed status', () => {
			expect( action.step.status ).toEqual( 'completed' );
		} );
	} );

	describe( 'processStep', () => {
		const action = processStep( step );

		test( 'dispatches an addOrUpdateStep action', () => {
			expect( action.type ).toEqual( SIGNUP_PROGRESS_ADD_OR_UPDATE );
		} );
		test( 'dispatches an action with a processing status', () => {
			expect( action.step.status ).toEqual( 'processing' );
		} );
	} );

	describe( 'setStepInvalid', () => {
		const errors = [ new Error( 'Example error' ) ];
		const action = setStepInvalid( step, errors );

		test( 'dispatches an addOrUpdateStep action', () => {
			expect( action.type ).toEqual( SIGNUP_PROGRESS_ADD_OR_UPDATE );
		} );
		test( 'dispatches an action with errors value', () => {
			expect( action.step.errors ).toEqual( errors );
		} );
	} );

	describe( 'submitStep', () => {
		test( 'dispatches an addOrUpdateStep action', () => {
			const action = submitStep( step );
			expect( action.type ).toEqual( SIGNUP_PROGRESS_ADD_OR_UPDATE );
		} );

		test( 'dispatches an action with a pending status value if it has an associated API function', () => {
			const action = submitStep( { stepName: 'user' } );
			expect( action.step.status ).toEqual( 'pending' );
		} );

		test( 'dispatches an action with a completed status value if does not have an associated API function', () => {
			const action = submitStep( step );
			expect( action.step.status ).toEqual( 'completed' );
		} );
	} );

	describe( 'removeUnneededSteps', () => {
		test( 'dispatches an action with step names corresponding to the inputted flow name', () => {
			flows.getFlow.mockReturnValueOnce( { steps: [ 'site-selection', 'user' ] } );
			const action = removeUnneededSteps( 'new-flow' );
			expect( action.validStepNames ).toEqual( [ 'site-selection', 'user' ] );
		} );
	} );
} );
