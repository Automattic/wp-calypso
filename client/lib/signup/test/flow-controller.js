/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { ary } from 'lodash';
import { createStore } from 'redux';

/**
 * Internal dependencies
 */
import { reducer } from 'state';
import SignupActions from '../actions';
import SignupDependencyStore from '../dependency-store';
import SignupFlowController from '../flow-controller';
import SignupProgressStore from '../progress-store';

jest.mock( 'lib/user', () => () => ( { get: () => ( {} ) } ) );
jest.mock( 'signup/config/flows', () => require( './mocks/signup/config/flows' ) );
jest.mock( 'signup/config/steps', () => require( './mocks/signup/config/steps' ) );

describe( 'flow-controller', () => {
	let signupFlowController;
	const store = createStore( reducer );

	afterEach( () => {
		signupFlowController.reset();
	} );

	describe( 'setup', () => {
		test( 'should have a redux store attached', () => {
			signupFlowController = SignupFlowController( {
				flowName: 'simple_flow',
				onComplete: () => {},
				reduxStore: store,
			} );
			expect( signupFlowController._reduxStore ).toEqual( store );
		} );
		test( 'should bind its redux store to both progress and dependency stores', () => {
			expect( SignupProgressStore.reduxStore ).toEqual( store );
			expect( SignupDependencyStore.reduxStore ).toEqual( store );
		} );
	} );

	describe( 'controlling a simple flow', () => {
		test( 'should run the onComplete callback with the flow destination when the flow is completed', done => {
			signupFlowController = SignupFlowController( {
				flowName: 'simple_flow',
				onComplete: function( dependencies, destination ) {
					expect( destination ).toEqual( '/' );
					done();
				},
				reduxStore: store,
			} );

			SignupActions.submitSignupStep( { stepName: 'stepA' } );
			SignupActions.submitSignupStep( { stepName: 'stepB' } );
		} );
	} );

	describe( 'controlling a flow w/ an asynchronous step', () => {
		beforeEach( () => {
			signupFlowController = SignupFlowController( {
				flowName: 'flow_with_async',
				reduxStore: store,
			} );
		} );

		test( 'should call apiRequestFunction on steps with that property', done => {
			SignupActions.submitSignupStep( { stepName: 'userCreation' }, [], { bearer_token: 'TOKEN' } );

			SignupActions.submitSignupStep( {
				stepName: 'asyncStep',
				done,
			} );
		} );

		test( 'should not call apiRequestFunction multiple times', done => {
			SignupActions.submitSignupStep( { stepName: 'userCreation' }, [], { bearer_token: 'TOKEN' } );
			SignupActions.submitSignupStep( {
				stepName: 'asyncStep',
				done,
			} );

			// resubmit the first step to initiate another call to SignupFlowController#_process
			// implicitly asserting that apiRequestFunction/done is only called once
			SignupActions.submitSignupStep( { stepName: 'userCreation' }, [], { bearer_token: 'TOKEN' } );
		} );
	} );

	describe( 'controlling a flow w/ dependencies', () => {
		test( 'should call the apiRequestFunction callback with its dependencies', done => {
			signupFlowController = SignupFlowController( {
				flowName: 'flow_with_dependencies',
				onComplete: function( dependencies, destination ) {
					expect( destination ).toEqual( '/checkout/testsite.wordpress.com' );
					done();
				},
				reduxStore: store,
			} );

			SignupActions.submitSignupStep( {
				stepName: 'siteCreation',
				stepCallback: function( dependencies ) {
					expect( dependencies ).toEqual( { bearer_token: 'TOKEN' } );
				},
			} );

			SignupActions.submitSignupStep( {
				stepName: 'userCreation',
			} );
		} );

		test( 'should throw an error when the flow is completed without all dependencies provided', () => {
			signupFlowController = SignupFlowController( {
				flowName: 'invalid_flow_with_dependencies',
				onComplete: function() {},
				reduxStore: store,
			} );

			SignupActions.submitSignupStep( { stepName: 'siteCreation' } );
			expect( () =>
				SignupActions.submitSignupStep( { stepName: 'userCreationWithoutToken' } )
			).toThrow();
		} );
	} );

	describe( 'controlling a flow w/ a delayed step', () => {
		test( 'should submit steps with the delayApiRequestUntilComplete once the flow is complete', done => {
			signupFlowController = SignupFlowController( {
				flowName: 'flowWithDelay',
				onComplete: ary( done, 0 ),
				reduxStore: store,
			} );

			SignupActions.submitSignupStep( {
				stepName: 'delayedStep',
				stepCallback: function() {
					expect( SignupProgressStore.get() ).toHaveLength( 2 );
				},
			} );

			SignupActions.submitSignupStep( { stepName: 'stepA' } );
		} );

		test( 'should not submit delayed steps if some steps are in-progress', done => {
			signupFlowController = SignupFlowController( {
				flowName: 'flowWithDelay',
				onComplete: ary( done, 0 ),
				reduxStore: store,
			} );

			SignupActions.submitSignupStep( {
				stepName: 'delayedStep',
				stepCallback: function() {
					expect( SignupProgressStore.get()[ 1 ].status ).toEqual( 'completed' );
				},
			} );

			// stepA should have status saving the step should not trigger the callback on `delayedStep`…
			SignupActions.saveSignupStep( { stepName: 'stepA' } );
			// …but submitting it should
			SignupActions.submitSignupStep( { stepName: 'stepA' } );
		} );
	} );

	describe( 'controlling a flow w/ dependencies provided in query', () => {
		test( 'should throw an error if the given flow requires dependencies from query but none are given', () => {
			expect( () =>
				SignupFlowController( {
					flowName: 'flowWithProvidedDependencies',
					reduxStore: store,
				} )
			).toThrow();
		} );

		test( 'should run `onComplete` once all steps are submitted without an error', done => {
			signupFlowController = SignupFlowController( {
				flowName: 'flowWithProvidedDependencies',
				providedDependencies: { siteSlug: 'foo' },
				onComplete: ary( done, 0 ),
				reduxStore: store,
			} );

			SignupActions.submitSignupStep( {
				stepName: 'stepRequiringSiteSlug',
			} );
		} );
	} );
} );
