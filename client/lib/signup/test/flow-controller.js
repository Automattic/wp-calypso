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
import { combineReducers } from 'calypso/state/utils';
import signupReducer from 'calypso/state/signup/reducer';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSignupProgress } from 'calypso/state/signup/progress/selectors';
import SignupFlowController from '../flow-controller';

jest.mock( 'calypso/signup/config/flows', () => require( './mocks/signup/config/flows' ) );
jest.mock( 'calypso/signup/config/flows-pure', () =>
	require( './mocks/signup/config/flows-pure' )
);
jest.mock( 'calypso/signup/config/steps', () => require( './mocks/signup/config/steps' ) );
jest.mock( 'calypso/signup/config/steps-pure', () => require( './mocks/signup/config/steps' ) );

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
		test( 'should run the onComplete callback with the flow destination when the flow is completed', () => {
			return new Promise( ( done ) => {
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

		// eslint-disable-next-line jest/expect-expect
		test( 'should call apiRequestFunction on steps with that property', () => {
			return new Promise( ( done ) => {
				store.dispatch(
					submitSignupStep( { stepName: 'userCreation' }, { bearer_token: 'TOKEN' } )
				);
				store.dispatch( submitSignupStep( { stepName: 'asyncStep', done } ) );
			} );
		} );

		// eslint-disable-next-line jest/expect-expect
		test( 'should not call apiRequestFunction multiple times', () => {
			return new Promise( ( done ) => {
				store.dispatch(
					submitSignupStep( { stepName: 'userCreation' }, { bearer_token: 'TOKEN' } )
				);
				store.dispatch( submitSignupStep( { stepName: 'asyncStep', done } ) );

				// resubmit the first step to initiate another call to SignupFlowController#_process
				// implicitly asserting that apiRequestFunction/done is only called once
				store.dispatch(
					submitSignupStep( { stepName: 'userCreation' }, { bearer_token: 'TOKEN' } )
				);
			} );
		} );
	} );

	describe( 'controlling a flow w/ dependencies', () => {
		test( 'should call the apiRequestFunction callback with its dependencies', () => {
			return new Promise( ( done ) => {
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
		} );
	} );

	describe( 'controlling a flow w/ a delayed step', () => {
		test( 'should submit steps with the delayApiRequestUntilComplete once the flow is complete', () => {
			return new Promise( ( done ) => {
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
		} );

		test( 'should not submit delayed steps if some steps are in-progress', () => {
			return new Promise( ( done ) => {
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

		// eslint-disable-next-line jest/expect-expect
		test( 'should run `onComplete` once all steps are submitted without an error', () => {
			return new Promise( ( done ) => {
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
	} );

	describe( 'controlling a flow with optional dependencies', () => {
		// eslint-disable-next-line jest/expect-expect
		test( 'should run `onComplete` once all steps are submitted, including optional dependency', () => {
			return new Promise( ( done ) => {
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
		} );

		// eslint-disable-next-line jest/expect-expect
		test( 'should run `onComplete` once all steps are submitted, excluding optional dependency', () => {
			return new Promise( ( done ) => {
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
