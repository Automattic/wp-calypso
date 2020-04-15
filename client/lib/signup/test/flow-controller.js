/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { size } from 'lodash';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import signupReducer from 'state/signup/reducer';
import { saveSignupStep, submitSignupStep } from 'state/signup/progress/actions';
import { getSignupProgress } from 'state/signup/progress/selectors';
import SignupFlowController from '../flow-controller';

jest.mock( 'signup/config/flows', () => require( './mocks/signup/config/flows' ) );
jest.mock( 'signup/config/flows-pure', () => require( './mocks/signup/config/flows-pure' ) );
jest.mock( 'signup/config/steps', () => require( './mocks/signup/config/steps' ) );
jest.mock( 'signup/config/steps-pure', () => require( './mocks/signup/config/steps' ) );

function createSignupStore( initialState ) {
	return createStore(
		combineReducers( { signup: signupReducer } ),
		initialState,
		applyMiddleware( thunk )
	);
}

describe( 'flow-controller', () => {
	let signupFlowController;

	afterEach( () => {
		signupFlowController.cleanup();
	} );

	describe( 'setup', () => {
		test( 'should have a redux store attached', () => {
			const store = createSignupStore();
			signupFlowController = new SignupFlowController( {
				flowName: 'simple_flow',
				onComplete: () => {},
				reduxStore: store,
			} );
			expect( signupFlowController._reduxStore ).toBe( store );
		} );

		test( 'should reset stores if there are processing steps in the state upon instantitaion', () => {
			const store = createSignupStore( {
				signup: {
					progress: [
						{ stepName: 'stepA', status: 'processing' },
						{ stepName: 'stepB' },
						{ stepName: 'stepC' },
					],
				},
			} );

			signupFlowController = new SignupFlowController( {
				flowName: 'simple_flow',
				onComplete: () => {},
				reduxStore: store,
			} );

			expect( getSignupProgress( store.getState() ) ).toEqual( {} );
		} );

		test( 'should reset stores if user is logged in and there is a user step in the saved progress', () => {
			const store = createSignupStore( {
				signup: {
					progress: [ { stepName: 'user' } ],
				},
			} );

			signupFlowController = new SignupFlowController( {
				flowName: 'simple_flow',
				onComplete: () => {},
				reduxStore: store,
			} );

			expect( getSignupProgress( store.getState() ) ).toEqual( {} );
		} );
	} );

	describe( 'controlling a simple flow', () => {
		test( 'should run the onComplete callback with the flow destination when the flow is completed', ( done ) => {
			const store = createSignupStore();

			signupFlowController = new SignupFlowController( {
				flowName: 'simple_flow',
				onComplete: function ( dependencies, destination ) {
					expect( destination ).toEqual( '/' );
					done();
				},
				reduxStore: store,
			} );

			store.dispatch( submitSignupStep( { stepName: 'stepA' } ) );
			store.dispatch( submitSignupStep( { stepName: 'stepB' } ) );
		} );
	} );

	describe( 'controlling a flow w/ an asynchronous step', () => {
		let store;
		beforeEach( () => {
			store = createSignupStore();
			signupFlowController = new SignupFlowController( {
				flowName: 'flow_with_async',
				reduxStore: store,
			} );
		} );

		test( 'should call apiRequestFunction on steps with that property', ( done ) => {
			store.dispatch( submitSignupStep( { stepName: 'userCreation' }, { bearer_token: 'TOKEN' } ) );
			store.dispatch( submitSignupStep( { stepName: 'asyncStep', done } ) );
		} );

		test( 'should not call apiRequestFunction multiple times', ( done ) => {
			store.dispatch( submitSignupStep( { stepName: 'userCreation' }, { bearer_token: 'TOKEN' } ) );
			store.dispatch( submitSignupStep( { stepName: 'asyncStep', done } ) );

			// resubmit the first step to initiate another call to SignupFlowController#_process
			// implicitly asserting that apiRequestFunction/done is only called once
			store.dispatch( submitSignupStep( { stepName: 'userCreation' }, { bearer_token: 'TOKEN' } ) );
		} );
	} );

	describe( 'controlling a flow w/ dependencies', () => {
		test( 'should call the apiRequestFunction callback with its dependencies', ( done ) => {
			const store = createSignupStore();
			signupFlowController = new SignupFlowController( {
				flowName: 'flow_with_dependencies',
				onComplete: function ( dependencies, destination ) {
					expect( destination ).toEqual( '/checkout/testsite.wordpress.com' );
					done();
				},
				reduxStore: store,
			} );

			store.dispatch(
				submitSignupStep( {
					stepName: 'siteCreation',
					stepCallback: function ( dependencies ) {
						expect( dependencies ).toEqual( { bearer_token: 'TOKEN' } );
					},
				} )
			);

			store.dispatch( submitSignupStep( { stepName: 'userCreation' } ) );
		} );

		test.skip( 'should throw an error when the flow is completed without all dependencies provided', () => {
			const store = createSignupStore();
			signupFlowController = new SignupFlowController( {
				flowName: 'invalid_flow_with_dependencies',
				onComplete: function () {},
				reduxStore: store,
			} );

			store.dispatch( submitSignupStep( { stepName: 'siteCreation' } ) );
			store.dispatch( submitSignupStep( { stepName: 'userCreationWithoutToken' } ) );
			// TODO: assert that the apiFunction handler that triggers completion of the flow
			// throws an exception. It's all inside async callbacks and difficult to test.
		} );
	} );

	describe( 'controlling a flow w/ a delayed step', () => {
		test( 'should submit steps with the delayApiRequestUntilComplete once the flow is complete', ( done ) => {
			const store = createSignupStore();
			signupFlowController = new SignupFlowController( {
				flowName: 'flowWithDelay',
				onComplete: () => done(),
				reduxStore: store,
			} );

			store.dispatch(
				submitSignupStep( {
					stepName: 'delayedStep',
					stepCallback: function () {
						const progress = getSignupProgress( store.getState() );
						expect( size( progress ) ).toBe( 2 );
					},
				} )
			);

			store.dispatch( submitSignupStep( { stepName: 'stepA' } ) );
		} );

		test( 'should not submit delayed steps if some steps are in-progress', ( done ) => {
			const store = createSignupStore();
			signupFlowController = new SignupFlowController( {
				flowName: 'flowWithDelay',
				onComplete: () => done(),
				reduxStore: store,
			} );

			store.dispatch(
				submitSignupStep( {
					stepName: 'delayedStep',
					stepCallback: function () {
						const progress = getSignupProgress( store.getState() );
						const step = progress.stepA;
						expect( step.status ).toBe( 'completed' );
					},
				} )
			);

			// stepA should have status saving the step should not trigger the callback on `delayedStep`…
			store.dispatch( saveSignupStep( { stepName: 'stepA' } ) );
			// …but submitting it should
			store.dispatch( submitSignupStep( { stepName: 'stepA' } ) );
		} );
	} );

	describe( 'controlling a flow w/ dependencies provided in query', () => {
		test( 'should throw an error if the given flow requires dependencies from query but none are given', () => {
			expect( () => {
				const store = createSignupStore();
				signupFlowController = new SignupFlowController( {
					flowName: 'flowWithProvidedDependencies',
					reduxStore: store,
				} );
			} ).toThrow();
		} );

		test( 'should run `onComplete` once all steps are submitted without an error', ( done ) => {
			const store = createSignupStore();
			signupFlowController = new SignupFlowController( {
				flowName: 'flowWithProvidedDependencies',
				providedDependencies: { siteSlug: 'foo' },
				onComplete: () => done(),
				reduxStore: store,
			} );

			store.dispatch( submitSignupStep( { stepName: 'stepRequiringSiteSlug' } ) );
		} );
	} );

	describe( 'controlling a flow with optional dependencies', () => {
		test( 'should run `onComplete` once all steps are submitted, including optional dependency', ( done ) => {
			const store = createSignupStore();
			signupFlowController = new SignupFlowController( {
				flowName: 'flowWithSiteTopicWithOptionalTheme',
				onComplete: () => done(),
				reduxStore: store,
			} );

			store.dispatch( submitSignupStep( { stepName: 'stepA' } ) );
			store.dispatch( submitSignupStep( { stepName: 'stepB' } ) );
			store.dispatch(
				submitSignupStep(
					{
						stepName: 'site-topic-with-optional-theme',
					},
					{
						siteTopic: 'foo',
						themeSlugWithRepo: 'bar',
					}
				)
			);
		} );

		test( 'should run `onComplete` once all steps are submitted, excluding optional dependency', ( done ) => {
			const store = createSignupStore();
			signupFlowController = new SignupFlowController( {
				flowName: 'flowWithSiteTopicWithOptionalTheme',
				onComplete: () => done(),
				reduxStore: store,
			} );

			store.dispatch( submitSignupStep( { stepName: 'stepA' } ) );
			store.dispatch( submitSignupStep( { stepName: 'stepB' } ) );
			store.dispatch(
				submitSignupStep(
					{
						stepName: 'site-topic-with-optional-theme',
					},
					{
						siteTopic: 'foo',
					}
				)
			);
		} );

		test( "should throw if step doesn't provide required dependency", () => {
			const store = createSignupStore();
			signupFlowController = new SignupFlowController( {
				flowName: 'flowWithSiteTopicWithOptionalTheme',
				onComplete: () => {},
				reduxStore: store,
			} );

			store.dispatch( submitSignupStep( { stepName: 'stepA' } ) );
			store.dispatch( submitSignupStep( { stepName: 'stepB' } ) );

			expect( () =>
				store.dispatch(
					submitSignupStep(
						{
							stepName: 'site-topic-with-optional-theme',
						},
						{
							themeSlugWithRepo: 'foo',
						}
					)
				)
			).toThrow( /the dependencies .* were not provided/i );
		} );
	} );
} );
