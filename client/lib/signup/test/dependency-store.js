/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import assert from 'assert';
import { createStore } from 'redux';

/**
 * Internal dependencies
 */
import { reducer } from 'client/state';

jest.mock( 'lib/user', () => () => {} );
jest.mock( 'signup/config/steps', () => require( './mocks/signup/config/steps' ) );

describe( 'dependency-store', () => {
	let SignupProgressStore, SignupDependencyStore, SignupActions;

	beforeAll( () => {
		SignupProgressStore = require( '../progress-store' );
		SignupDependencyStore = require( '../dependency-store' );
		SignupActions = require( '../actions' );

		const store = createStore( reducer );
		SignupDependencyStore.setReduxStore( store );
	} );

	afterEach( () => {
		SignupProgressStore.reset();
	} );

	test( 'should return an empty object at first', () => {
		assert.deepEqual( SignupDependencyStore.get(), {} );
	} );

	test( 'should not store dependencies if none are included in an action', () => {
		SignupActions.submitSignupStep( { stepName: 'stepA' } );
		assert.deepEqual( SignupDependencyStore.get(), {} );
	} );

	test( 'should store dependencies if they are provided in either signup action', () => {
		SignupActions.submitSignupStep( { stepName: 'userCreation' }, [], { bearer_token: 'TOKEN' } );

		assert.deepEqual( SignupDependencyStore.get(), { bearer_token: 'TOKEN' } );

		SignupActions.processedSignupStep( { stepName: 'userCreation' }, [], {
			bearer_token: 'TOKEN2',
		} );

		assert.deepEqual( SignupDependencyStore.get(), { bearer_token: 'TOKEN2' } );
	} );

	test( 'should store dependencies if they are provided in the `PROVIDE_SIGNUP_DEPENDENCIES` action', () => {
		const dependencies = {
			foo: 'bar',
			baz: 'test',
		};

		SignupActions.provideDependencies( dependencies );

		assert.deepEqual( SignupDependencyStore.get(), { bearer_token: 'TOKEN2', ...dependencies } );
	} );
} );
