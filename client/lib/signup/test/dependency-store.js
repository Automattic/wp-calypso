/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { createStore } from 'redux';

/**
 * Internal dependencies
 */
import reducer from 'state/reducer';

jest.mock( 'lib/user', () => () => {} );
jest.mock( 'signup/config/steps', () => require( './mocks/signup/config/steps' ) );
jest.mock( 'signup/config/steps-pure', () => require( './mocks/signup/config/steps' ) );

describe( 'dependency-store', () => {
	let SignupProgressStore, SignupDependencyStore, SignupActions;

	beforeAll( () => {
		SignupProgressStore = require( '../progress-store' );
		SignupDependencyStore = require( '../dependency-store' );
		SignupActions = require( '../actions' );

		const store = createStore( reducer );
		SignupDependencyStore.setReduxStore( store );
		SignupProgressStore.setReduxStore( store );
	} );

	afterEach( () => {
		SignupDependencyStore.reset();
		SignupProgressStore.reset();
	} );

	test( 'should return an empty object at first', () => {
		expect( SignupDependencyStore.get() ).toEqual( {} );
	} );

	test( 'should not store dependencies if none are included in an action', () => {
		SignupActions.submitSignupStep( { stepName: 'stepA' } );
		expect( SignupDependencyStore.get() ).toEqual( {} );
	} );

	test( 'should store dependencies if they are provided in either signup action', () => {
		SignupActions.submitSignupStep( { stepName: 'userCreation' }, { bearer_token: 'TOKEN' } );

		expect( SignupDependencyStore.get() ).toEqual( { bearer_token: 'TOKEN' } );

		SignupActions.completeSignupStep( { stepName: 'userCreation' }, [], {
			bearer_token: 'TOKEN2',
		} );

		expect( SignupDependencyStore.get() ).toEqual( { bearer_token: 'TOKEN2' } );
	} );

	test( 'should store dependencies if they are provided in the `PROVIDE_SIGNUP_DEPENDENCIES` action', () => {
		const dependencies = {
			foo: 'bar',
			baz: 'test',
		};

		SignupActions.provideDependencies( dependencies );

		expect( SignupDependencyStore.get() ).toEqual( dependencies );
	} );
} );
