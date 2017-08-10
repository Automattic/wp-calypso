/** @jest-environment jsdom */
jest.mock( 'lib/user', () => () => {} );
jest.mock( 'signup/config/steps', () => require( './mocks/signup/config/steps' ) );

/**
 * External dependencies
 */
import assert from 'assert';

/**
 * Internal dependencies
 */
import { createStore } from 'redux';
import { reducer } from 'state';

describe( 'dependency-store', function() {
	let SignupProgressStore,
		SignupDependencyStore,
		SignupActions;

	before( () => {
		SignupProgressStore = require( '../progress-store' );
		SignupDependencyStore = require( '../dependency-store' );
		SignupActions = require( '../actions' );

		const store = createStore( reducer );
		SignupDependencyStore.setReduxStore( store );
	} );

	afterEach( function() {
		SignupProgressStore.reset();
	} );

	it( 'should return an empty object at first', function() {
		assert.deepEqual( SignupDependencyStore.get(), {} );
	} );

	it( 'should not store dependencies if none are included in an action', function() {
		SignupActions.submitSignupStep( { stepName: 'stepA' } );
		assert.deepEqual( SignupDependencyStore.get(), {} );
	} );

	it( 'should store dependencies if they are provided in either signup action', function() {
		SignupActions.submitSignupStep( { stepName: 'userCreation' }, [], { bearer_token: 'TOKEN' } );

		assert.deepEqual( SignupDependencyStore.get(), { bearer_token: 'TOKEN' } );

		SignupActions.processedSignupStep( { stepName: 'userCreation', }, [], { bearer_token: 'TOKEN2' } );

		assert.deepEqual( SignupDependencyStore.get(), { bearer_token: 'TOKEN2' } );
	} );

	it( 'should store dependencies if they are provided in the `PROVIDE_SIGNUP_DEPENDENCIES` action', () => {
		const dependencies = {
			foo: 'bar',
			baz: 'test'
		};

		SignupActions.provideDependencies( dependencies );

		assert.deepEqual( SignupDependencyStore.get(), { bearer_token: 'TOKEN2', ...dependencies } );
	} );
} );
