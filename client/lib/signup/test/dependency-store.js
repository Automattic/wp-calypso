/**
 * External dependencies
 */
import assert from 'assert';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import { createStore } from 'redux';
import { reducer } from 'state';

describe( 'dependency-store', function() {
	let SignupProgressStore,
		SignupDependencyStore,
		SignupActions;

	useFakeDom();
	require( 'test/helpers/use-filesystem-mocks' )( __dirname );

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
} );
