/**
 * External dependencies
 */
import sinon from 'sinon';

import assert from 'assert';
import omit from 'lodash/omit';
import find from 'lodash/find';
import last from 'lodash/last';
import defer from 'lodash/defer';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery' ;

describe( 'progress-store', function() {
	let SignupProgressStore, SignupActions, Dispatcher;

	useFakeDom();
	require( 'test/helpers/use-filesystem-mocks' )( __dirname );

	before( () => {
		Dispatcher = require( 'dispatcher' );

		useMockery( ( mockery ) => {
			mockery.registerMock( 'dispatcher', Dispatcher );
			mockery.registerMock( './dependency-store', {
				dispatchToken: Dispatcher.register( ()=> {} )
			} );
		} );

		SignupProgressStore = require( '../progress-store' );
		SignupActions = require( '../actions' );
	} );

	it( 'should return an empty at first', function() {
		assert.equal( SignupProgressStore.get().length, 0 );
	} );

	it( 'should store a new step', function() {
		SignupActions.submitSignupStep( {
			stepName: 'site-selection',
			formData: { url: 'my-site.wordpress.com' }
		} );

		assert.equal( SignupProgressStore.get().length, 1 );
		assert.equal( SignupProgressStore.get()[ 0 ].stepName, 'site-selection' );
	} );

	describe( 'timestamps', function() {
		beforeEach( () => {
			this.clock = sinon.useFakeTimers( 12345 );
		} );

		afterEach( () => {
			this.clock.restore();
		} );

		it( 'should be updated at each step', function() {
			Dispatcher.handleViewAction( {
				type: 'SAVE_SIGNUP_STEP',
				data: {
					stepName: 'site-selection'
				}
			} );

			assert.equal( SignupProgressStore.get()[ 0 ].lastUpdated, 12345 );
		} );
	} );

	it( 'should not store the same step twice', function() {
		SignupActions.submitSignupStep( { stepName: 'site-selection' } );

		assert.equal( SignupProgressStore.get().length, 1 );
		assert.deepEqual( omit( SignupProgressStore.get()[ 0 ], 'lastUpdated' ), {
			stepName: 'site-selection',
			formData: { url: 'my-site.wordpress.com' },
			status: 'completed'
		} );
	} );

	it( 'should not be possible to mutate', function() {
		assert.equal( SignupProgressStore.get().length, 1 );

		// attempt to mutate
		SignupProgressStore.get().pop();

		assert.equal( SignupProgressStore.get().length, 1 );
	} );

	it( 'should store multiple steps in order', function() {
		SignupActions.submitSignupStep( { stepName: 'theme-selection' } );

		assert.equal( SignupProgressStore.get().length, 2 );
		assert.equal( SignupProgressStore.get()[ 0 ].stepName, 'site-selection' );
		assert.equal( SignupProgressStore.get()[ 1 ].stepName, 'theme-selection' );
	} );

	it( 'should mark submitted steps without an API request method as completed', function() {
		SignupActions.submitSignupStep( { stepName: 'step-without-api' } );

		assert.equal( find( SignupProgressStore.get(), { stepName: 'step-without-api' } ).status, 'completed' );
	} );

	it( 'should mark submitted steps with an API request method as pending', function() {
		SignupActions.submitSignupStep( {
			stepName: 'asyncStep'
		} );

		assert.equal( find( SignupProgressStore.get(), { stepName: 'asyncStep' } ).status, 'pending' );
	} );

	it( 'should mark only new saved steps as in-progress', function() {
		SignupActions.saveSignupStep( { stepName: 'site-selection' } );
		defer( () => {
			assert.notEqual( SignupProgressStore.get()[ 0 ].status, 'in-progress' );
		} );

		SignupActions.saveSignupStep( { stepName: 'last-step' } );
		defer( () => {
			assert.equal( last( SignupProgressStore.get() ).status, 'in-progress' );
		} );
	} );

	it( 'should set the status of a signup step', function() {
		SignupActions.submitSignupStep( { stepName: 'site-selection' } );
		assert.equal( SignupProgressStore.get()[ 0 ].status, 'completed' );

		SignupActions.processedSignupStep( { stepName: 'site-selection' } );
		assert.equal( SignupProgressStore.get()[ 0 ].status, 'completed' );
	} );
} );
