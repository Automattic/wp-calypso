/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import assert from 'assert'; // eslint-disable-line import/no-nodejs-modules
import { createStore } from 'redux';

/**
 * Internal dependencies
 */
import { reducer } from 'state';
import { getSignupDependencies as selectSignupDependencies } from 'state/signup/dependency-store/selectors';

jest.mock( 'lib/user', () => () => {} );
jest.mock( 'signup/config/steps', () => require( './mocks/signup/config/steps' ) );

describe( 'dependency-store', () => {
	let store, SignupProgressStore, getSignupDependencies, SignupActions;

	beforeAll( () => {
		SignupProgressStore = require( '../progress-store' );

		SignupActions = require( '../actions' );

		store = createStore( reducer );
		SignupProgressStore.setReduxStore( store );
		getSignupDependencies = () => selectSignupDependencies( store.getState() );
	} );

	afterEach( () => {
		SignupProgressStore.reset();
	} );

	// TODO: Refactor and move these tests to signup/dependency-store/test/reducer
	//       once signup has been reduxified.

	test( 'should return an empty object at first', () => {
		assert.deepEqual( getSignupDependencies(), {} );
	} );

	test( 'should not store dependencies if none are included in an action', () => {
		SignupActions.submitSignupStep( { stepName: 'stepA' } );
		assert.deepEqual( getSignupDependencies(), {} );
	} );

	test( 'should store dependencies if they are provided in either signup action', () => {
		SignupActions.submitSignupStep( { stepName: 'userCreation' }, [], { bearer_token: 'TOKEN' } );

		assert.deepEqual( getSignupDependencies(), { bearer_token: 'TOKEN' } );

		SignupActions.processedSignupStep( { stepName: 'userCreation' }, [], {
			bearer_token: 'TOKEN2',
		} );

		assert.deepEqual( getSignupDependencies(), { bearer_token: 'TOKEN2' } );
	} );

	test( 'should store dependencies if they are provided in the `PROVIDE_SIGNUP_DEPENDENCIES` action', () => {
		const dependencies = {
			foo: 'bar',
			baz: 'test',
		};

		SignupActions.provideDependencies( dependencies );

		assert.deepEqual( getSignupDependencies(), { bearer_token: 'TOKEN2', ...dependencies } );
	} );
} );
