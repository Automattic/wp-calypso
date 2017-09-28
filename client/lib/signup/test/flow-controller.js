/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import assert from 'assert';
import { ary, defer } from 'lodash';

/**
 * Internal dependencies
 */
import { createStore } from 'redux';
import { reducer } from 'state';

describe( 'flow-controller', function() {
	let SignupProgressStore,
		SignupDependencyStore,
		SignupFlowController,
		SignupActions,
		signupFlowController;

	require( 'test/helpers/use-filesystem-mocks' )( __dirname );

	before( () => {
		SignupProgressStore = require( '../progress-store' );
		SignupDependencyStore = require( '../dependency-store' );
		SignupFlowController = require( '../flow-controller' );
		SignupActions = require( '../actions' );
		SignupProgressStore.reset();

		const store = createStore( reducer );
		SignupDependencyStore.setReduxStore( store );
	} );

	afterEach( function() {
		signupFlowController.reset();
		SignupDependencyStore.reset();
		SignupProgressStore.reset();
	} );

	describe( 'controlling a simple flow', function() {
		it( 'should run the onComplete callback with the flow destination when the flow is completed', function( done ) {
			signupFlowController = SignupFlowController( {
				flowName: 'simple_flow',
				onComplete: function( dependencies, destination ) {
					assert.equal( destination, '/' );
					done();
				}
			} );

			SignupActions.submitSignupStep( { stepName: 'stepA' } );
			SignupActions.submitSignupStep( { stepName: 'stepB' } );
		} );
	} );

	describe( 'controlling a flow w/ an asynchronous step', function() {
		beforeEach( function() {
			signupFlowController = SignupFlowController( { flowName: 'flow_with_async' } );
		} );

		it( 'should call apiRequestFunction on steps with that property', function( done ) {
			SignupActions.submitSignupStep( { stepName: 'userCreation' }, [], { bearer_token: 'TOKEN' } );

			SignupActions.submitSignupStep( {
				stepName: 'asyncStep',
				done: done
			} );
		} );

		it( 'should not call apiRequestFunction multiple times', function( done ) {
			SignupActions.submitSignupStep( { stepName: 'userCreation' }, [], { bearer_token: 'TOKEN' } );
			SignupActions.submitSignupStep( {
				stepName: 'asyncStep',
				done: done
			} );

			// resubmit the first step to initiate another call to SignupFlowController#_process
			// implicitly asserting that apiRequestFunction/done is only called once
			SignupActions.submitSignupStep( { stepName: 'userCreation' }, [], { bearer_token: 'TOKEN' } );
		} );
	} );

	describe( 'controlling a flow w/ dependencies', function() {
		it( 'should call the apiRequestFunction callback with its dependencies', function( done ) {
			signupFlowController = SignupFlowController( {
				flowName: 'flow_with_dependencies',
				onComplete: function( dependencies, destination ) {
					assert.equal( destination, '/checkout/testsite.wordpress.com' );
					done();
				}
			} );

			SignupActions.submitSignupStep( {
				stepName: 'siteCreation',
				stepCallback: function( dependencies ) {
					assert.deepEqual( dependencies, { bearer_token: 'TOKEN' } );
				}
			} );

			SignupActions.submitSignupStep( {
				stepName: 'userCreation'
			} );
		} );

		it( 'should throw an error when the flow is completed without all dependencies provided', function() {
			signupFlowController = SignupFlowController( {
				flowName: 'invalid_flow_with_dependencies',
				onComplete: function() {}
			} );

			SignupActions.submitSignupStep( { stepName: 'siteCreation' } );
			assert.throws( function() {
				SignupActions.submitSignupStep( { stepName: 'userCreationWithoutToken' } );
			} );
		} );
	} );

	describe( 'controlling a flow w/ a delayed step', function() {
		it( 'should submit steps with the delayApiRequestUntilComplete once the flow is complete', function( done ) {
			signupFlowController = SignupFlowController( {
				flowName: 'flowWithDelay',
				onComplete: ary( done, 0 )
			} );

			SignupActions.submitSignupStep( {
				stepName: 'delayedStep', stepCallback: function() {
					assert.equal( SignupProgressStore.get().length, 2 );
				}
			} );

			defer( function() {
				SignupActions.submitSignupStep( { stepName: 'stepA' } );
			} );
		} );

		it( 'should not submit delayed steps if some steps are in-progress', function( done ) {
			signupFlowController = SignupFlowController( {
				flowName: 'flowWithDelay',
				onComplete: ary( done, 0 )
			} );

			SignupActions.submitSignupStep( {
				stepName: 'delayedStep', stepCallback: function() {
					assert.equal( SignupProgressStore.get()[ 1 ].status, 'completed' );
				}
			} );

			defer( function() {
				// saving the step should not trigger the callback on `delayedStep`…
				SignupActions.saveSignupStep( { stepName: 'stepA' } );

				defer( function() {
					// …but submitting it should
					SignupActions.submitSignupStep( { stepName: 'stepA' } );
				} );
			} );
		} );
	} );

	describe( 'controlling a flow w/ dependencies provided in query', function() {
		it( 'should throw an error if the given flow requires dependencies from query but none are given', function() {
			assert.throws( function() {
				SignupFlowController( {
					flowName: 'flowWithProvidedDependencies'
				} );
			} );
		} );

		it( 'should run `onComplete` once all steps are submitted without an error', function( done ) {
			signupFlowController = SignupFlowController( {
				flowName: 'flowWithProvidedDependencies',
				providedDependencies: { siteSlug: 'foo' },
				onComplete: ary( done, 0 )
			} );

			SignupActions.submitSignupStep( {
				stepName: 'stepRequiringSiteSlug'
			} );
		} );
	} );
} );
