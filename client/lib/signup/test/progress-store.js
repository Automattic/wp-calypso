/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import assert from 'assert'; // eslint-disable-line import/no-nodejs-modules
import { defer, find, last, omit } from 'lodash';
import sinon from 'sinon';
import { createStore } from 'redux';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import { reducer } from 'state';
import SignupActions from '../actions';
import SignupProgressStore from '../progress-store';

jest.mock( 'lib/user', () => () => {} );
jest.mock( 'signup/config/steps', () => require( './mocks/signup/config/steps' ) );

describe( 'progress-store', () => {
	beforeAll( () => {
		const store = createStore( reducer );
		SignupProgressStore.setReduxStore( store );
	} );

	test( 'should return an empty at first', () => {
		assert.equal( SignupProgressStore.get().length, 0 );
	} );

	test( 'should store a new step', () => {
		SignupActions.submitSignupStep( {
			stepName: 'site-selection',
			formData: { url: 'my-site.wordpress.com' },
		} );

		assert.equal( SignupProgressStore.get().length, 1 );
		assert.equal( SignupProgressStore.get()[ 0 ].stepName, 'site-selection' );
	} );

	describe( 'timestamps', () => {
		let clock;

		beforeEach( () => {
			clock = sinon.useFakeTimers( 12345 );
		} );

		afterEach( () => {
			clock.restore();
		} );

		test( 'should be updated at each step', () => {
			Dispatcher.handleViewAction( {
				type: 'SAVE_SIGNUP_STEP',
				data: {
					stepName: 'site-selection',
				},
			} );

			assert.equal( SignupProgressStore.get()[ 0 ].lastUpdated, 12345 );
		} );
	} );

	test( 'should not store the same step twice', () => {
		SignupActions.submitSignupStep( { stepName: 'site-selection' } );

		assert.equal( SignupProgressStore.get().length, 1 );
		assert.deepEqual( omit( SignupProgressStore.get()[ 0 ], 'lastUpdated' ), {
			stepName: 'site-selection',
			formData: { url: 'my-site.wordpress.com' },
			status: 'completed',
		} );
	} );

	test( 'should not be possible to mutate', () => {
		assert.equal( SignupProgressStore.get().length, 1 );

		// attempt to mutate
		SignupProgressStore.get().pop();

		assert.equal( SignupProgressStore.get().length, 1 );
	} );

	test( 'should store multiple steps in order', () => {
		SignupActions.submitSignupStep( { stepName: 'theme-selection' } );

		assert.equal( SignupProgressStore.get().length, 2 );
		assert.equal( SignupProgressStore.get()[ 0 ].stepName, 'site-selection' );
		assert.equal( SignupProgressStore.get()[ 1 ].stepName, 'theme-selection' );
	} );

	test( 'should mark submitted steps without an API request method as completed', () => {
		SignupActions.submitSignupStep( { stepName: 'step-without-api' } );

		assert.equal(
			find( SignupProgressStore.get(), { stepName: 'step-without-api' } ).status,
			'completed'
		);
	} );

	test( 'should mark submitted steps with an API request method as pending', () => {
		SignupActions.submitSignupStep( {
			stepName: 'asyncStep',
		} );

		assert.equal( find( SignupProgressStore.get(), { stepName: 'asyncStep' } ).status, 'pending' );
	} );

	test( 'should mark only new saved steps as in-progress', () => {
		SignupActions.saveSignupStep( { stepName: 'site-selection' } );
		defer( () => {
			assert.notEqual( SignupProgressStore.get()[ 0 ].status, 'in-progress' );
		} );

		SignupActions.saveSignupStep( { stepName: 'last-step' } );
		defer( () => {
			assert.equal( last( SignupProgressStore.get() ).status, 'in-progress' );
		} );
	} );

	test( 'should set the status of a signup step', () => {
		SignupActions.submitSignupStep( { stepName: 'site-selection' } );
		assert.equal( SignupProgressStore.get()[ 0 ].status, 'completed' );

		SignupActions.processedSignupStep( { stepName: 'site-selection' } );
		assert.equal( SignupProgressStore.get()[ 0 ].status, 'completed' );
	} );

	describe( 'subscriptions', () => {
		beforeEach( () => {
			SignupProgressStore.reset();
		} );

		test( 'should handle adding and removing subscriptions', () => {
			const callback = () => {};
			SignupProgressStore.subscribe( callback );
			assert.equal( SignupProgressStore.subscribers.size, 1 );
			assert.equal( typeof SignupProgressStore.subscribers.get( callback ), 'function' );

			SignupProgressStore.unsubscribe( callback );
			assert.equal( SignupProgressStore.subscribers.size, 0 );
			assert.equal( typeof SignupProgressStore.subscribers.get( callback ), 'undefined' );
		} );

		test( 'should notify subscribers only if the values change', done => {
			const stepName = 'site-selection';
			SignupProgressStore.subscribe( () => {
				assert.equal( SignupProgressStore.get().length, 1 );
				assert.equal( SignupProgressStore.get()[ 0 ].stepName, stepName );
				done();
			} );

			assert.equal( SignupProgressStore.get().length, 0 );
			SignupActions.submitSignupStep( { stepName } );
		} );
	} );
} );
