/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { first, defer, find, last, omit } from 'lodash';
import sinon from 'sinon';
import { createStore } from 'redux';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import flows from 'signup/config/flows';
import { reducer } from 'state';
import SignupActions from '../actions';
import SignupProgressStore from '../progress-store';

jest.mock( 'lib/user', () => () => {} );
jest.mock( 'signup/config/steps', () => require( './mocks/signup/config/steps' ) );
jest.mock( 'signup/config/flows', () => ( {
	getFlow: jest.fn(),
} ) );

describe( 'progress-store', () => {
	beforeAll( () => {
		const store = createStore( reducer );
		SignupProgressStore.setReduxStore( store );
	} );

	afterEach( () => {
		SignupProgressStore.reset();
	} );

	test( 'should return an empty at first', () => {
		expect( SignupProgressStore.get() ).toHaveLength( 0 );
	} );

	test( 'should store a new step', () => {
		SignupActions.submitSignupStep( {
			stepName: 'site-selection',
			formData: { url: 'my-site.wordpress.com' },
		} );

		expect( SignupProgressStore.get() ).toHaveLength( 1 );
		expect( first( SignupProgressStore.get() ).stepName ).toEqual( 'site-selection' );
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

			expect( first( SignupProgressStore.get() ).lastUpdated ).toEqual( 12345 );
		} );
	} );

	test( 'should not store the same step twice', done => {
		SignupActions.submitSignupStep( {
			stepName: 'site-selection',
			formData: { url: 'my-site.wordpress.com' },
		} );

		SignupActions.submitSignupStep( { stepName: 'site-selection' } );

		defer( () => {
			expect( SignupProgressStore.get() ).toHaveLength( 1 );
			expect( omit( first( SignupProgressStore.get() ), 'lastUpdated' ) ).toEqual( {
				stepName: 'site-selection',
				formData: { url: 'my-site.wordpress.com' },
				status: 'completed',
			} );
			done();
		} );
	} );

	test( 'should not be possible to mutate', () => {
		SignupActions.submitSignupStep( { stepName: 'site-selection' } );
		expect( SignupProgressStore.get() ).toHaveLength( 1 );

		// attempt to mutate
		SignupProgressStore.get().pop();

		expect( SignupProgressStore.get() ).toHaveLength( 1 );
	} );

	test( 'should store multiple steps in order', () => {
		SignupActions.submitSignupStep( { stepName: 'site-selection' } );
		SignupActions.submitSignupStep( { stepName: 'theme-selection' } );

		expect( SignupProgressStore.get() ).toHaveLength( 2 );
		expect( first( SignupProgressStore.get() ).stepName ).toEqual( 'site-selection' );
		expect( SignupProgressStore.get()[ 1 ].stepName ).toEqual( 'theme-selection' );
	} );

	test( 'should mark submitted steps without an API request method as completed', () => {
		SignupActions.submitSignupStep( { stepName: 'step-without-api' } );

		expect( find( SignupProgressStore.get(), { stepName: 'step-without-api' } ).status ).toEqual(
			'completed'
		);
	} );

	test( 'should mark submitted steps with an API request method as pending', () => {
		SignupActions.submitSignupStep( {
			stepName: 'asyncStep',
		} );

		expect( find( SignupProgressStore.get(), { stepName: 'asyncStep' } ).status ).toEqual(
			'pending'
		);
	} );

	test( 'should mark only new saved steps as in-progress', () => {
		SignupActions.saveSignupStep( { stepName: 'site-selection' } );
		SignupActions.saveSignupStep( { stepName: 'last-step' } );

		defer( () => {
			expect( first( SignupProgressStore.get() ).status ).not.toEqual( 'in-progress' );
			expect( last( SignupProgressStore.get() ).status ).toEqual( 'in-progress' );
		} );
	} );

	test( 'should set the status of a signup step', () => {
		SignupActions.submitSignupStep( { stepName: 'site-selection' } );
		expect( first( SignupProgressStore.get() ).status ).toEqual( 'completed' );

		SignupActions.processedSignupStep( { stepName: 'site-selection' } );
		expect( first( SignupProgressStore.get() ).status ).toEqual( 'completed' );
	} );

	describe( 'set', () => {
		beforeEach( () => {
			SignupProgressStore.reset();
		} );
		test( 'should overwrite existing progress data', () => {
			SignupProgressStore.set( [ { stepName: 'fake name' } ] );
			expect( SignupProgressStore.get() ).toEqual( [ { stepName: 'fake name' } ] );

			SignupProgressStore.set( [ { stepName: 'fake name' }, { stepName: 'fake name 2' } ] );
			expect( SignupProgressStore.get() ).toEqual( [
				{ stepName: 'fake name' },
				{ stepName: 'fake name 2' },
			] );
		} );
	} );

	describe( 'subscriptions', () => {
		beforeEach( () => {
			SignupProgressStore.reset();
		} );

		test( 'should handle adding and removing subscriptions', () => {
			const callback = () => {};
			SignupProgressStore.subscribe( callback );
			expect( SignupProgressStore.subscribers.size ).toEqual( 1 );
			expect( SignupProgressStore.subscribers.get( callback ) ).toBeInstanceOf( Function );

			SignupProgressStore.unsubscribe( callback );
			expect( SignupProgressStore.subscribers.size ).toEqual( 0 );
			expect( SignupProgressStore.subscribers.get( callback ) ).not.toBeDefined();
		} );

		test( 'should not have any subscribers by default', () => {
			expect( SignupProgressStore.get() ).toHaveLength( 0 );
			expect( SignupProgressStore.subscribers.size ).toEqual( 0 );
		} );

		test( 'should not trigger any subscribers without a value change', () => {
			const callback = jest.fn();
			SignupProgressStore.subscribe( callback );
			expect( callback ).not.toHaveBeenCalled();
			expect( SignupProgressStore.subscribers.size ).toEqual( 1 );
		} );

		test( 'should notify subscribers only if the values change', () => {
			const stepName = 'site-selection';

			// Make a subscription
			const callback = jest.fn();
			SignupProgressStore.subscribe( callback );

			// Trigger a change, which should call the first callback
			SignupProgressStore.set( [ { stepName } ] );
			expect( callback ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'should not notify subscribers if the value has remained the same', () => {
			const stepName = 'some-fake-step-name';

			SignupProgressStore.set( [ { stepName } ] );

			const uncalledCallback = jest.fn();
			SignupProgressStore.subscribe( uncalledCallback );
			expect( uncalledCallback ).not.toHaveBeenCalled();

			SignupProgressStore.set( [ { stepName } ] );
			expect( uncalledCallback ).not.toHaveBeenCalled();
		} );
	} );

	test( 'should remove unneeded steps when flow changes', () => {
		SignupProgressStore.set( [
			{ stepName: 'some-fake-step-name' },
			{ stepName: 'some-other-fake-step-name' },
		] );
		expect( SignupProgressStore.get() ).toHaveLength( 2 );

		flows.getFlow.mockReturnValueOnce( { steps: [ 'some-fake-step-name' ] } );
		SignupActions.changeSignupFlow( 'new-flow' );

		expect( SignupProgressStore.get() ).toHaveLength( 1 );

		flows.getFlow.mockReturnValueOnce( { steps: [ 'no-step-matches' ] } );
		SignupActions.changeSignupFlow( 'another-new-flow' );

		expect( SignupProgressStore.get() ).toHaveLength( 0 );
	} );
} );
