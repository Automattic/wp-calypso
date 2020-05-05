/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import { handleStepNext, handleStepSuccess, handleStepFailure } from '../';
import {
	actionListAnnotate,
	actionListStepNext,
	actionListStepSuccess,
	actionListStepFailure,
} from 'woocommerce/state/action-list/actions';
import * as fxt from 'woocommerce/state/action-list/test/fixtures';
import {
	WOOCOMMERCE_ACTION_LIST_ANNOTATE,
	WOOCOMMERCE_ACTION_LIST_STEP_NEXT,
} from 'woocommerce/state/action-types';

describe( 'handlers', () => {
	let store;

	beforeEach( () => {
		store = {
			dispatch: spy(),
		};
	} );

	describe( '#handleStepNext', () => {
		test( 'should annotate the actionList to the reducer state', () => {
			const actionListBefore = {
				nextSteps: [ fxt.stepA, fxt.stepB, fxt.stepC ],
			};

			const actionListAfter = {
				prevSteps: undefined,
				currentStep: fxt.stepAStarted,
				nextSteps: [ fxt.stepB, fxt.stepC ],
			};

			handleStepNext( store, actionListStepNext( actionListBefore ), fxt.time.stepAStart );

			expect( store.dispatch ).to.have.been.calledWith( actionListAnnotate( actionListAfter ) );
		} );

		test( 'should run the first step in the list', () => {
			const actionListBefore = {
				nextSteps: [ fxt.stepA, fxt.stepB, fxt.stepC ],
			};

			const actionListAfter = {
				prevSteps: undefined,
				currentStep: fxt.stepAStarted,
				nextSteps: [ fxt.stepB, fxt.stepC ],
			};

			handleStepNext( store, actionListStepNext( actionListBefore ), fxt.time.stepAStart );

			expect( store.dispatch ).to.have.been.calledWith( { type: '%% action a %%' } );
			expect( store.dispatch ).to.have.been.calledWith( actionListStepSuccess( actionListAfter ) );
		} );

		test( 'should run a middle step in the list', () => {
			const actionListBefore = {
				prevSteps: [ fxt.stepASuccessful ],
				currentStep: null,
				nextSteps: [ fxt.stepB, fxt.stepC ],
			};

			const actionListAfter = {
				prevSteps: [ fxt.stepASuccessful ],
				currentStep: fxt.stepBStarted,
				nextSteps: [ fxt.stepC ],
			};

			handleStepNext( store, actionListStepNext( actionListBefore ), fxt.time.stepBStart );

			expect( store.dispatch ).to.have.been.calledWith( { type: '%% action b %%' } );
			expect( store.dispatch ).to.have.been.calledWith( actionListStepSuccess( actionListAfter ) );
		} );

		test( 'should run a last step in the list', () => {
			const actionListBefore = {
				prevSteps: [ fxt.stepASuccessful, fxt.stepBSuccessful ],
				currentStep: null,
				nextSteps: [ fxt.stepC ],
			};

			const actionListAfter = {
				prevSteps: [ fxt.stepASuccessful, fxt.stepBSuccessful ],
				currentStep: fxt.stepCStarted,
				nextSteps: [],
			};

			handleStepNext( store, actionListStepNext( actionListBefore ), fxt.time.stepCStart );

			expect( store.dispatch ).to.have.been.calledWith( { type: '%% action c %%' } );
			expect( store.dispatch ).to.have.been.calledWith( actionListStepSuccess( actionListAfter ) );
		} );

		test( 'should propagate an error state', () => {
			const actionListBefore = {
				prevSteps: [ fxt.stepASuccessful ],
				currentStep: null,
				nextSteps: [ fxt.stepE, fxt.stepC ],
			};

			const actionListAfter = {
				prevSteps: [ fxt.stepASuccessful ],
				currentStep: fxt.stepEStarted,
				nextSteps: [ fxt.stepC ],
			};

			handleStepNext( store, actionListStepNext( actionListBefore ), fxt.time.stepEStart );

			expect( store.dispatch ).to.have.been.calledWith( { type: '%% error action %%' } );
			expect( store.dispatch ).to.have.been.calledWith(
				actionListStepFailure( actionListAfter, fxt.stepEError )
			);
		} );

		test( 'should pass data from one step to future steps', () => {
			const data = { one: 1, two: 2, three: 3 };

			const step1 = {
				description: 'Get Data',
				onStep: ( dispatch, actionList ) => {
					const newActionList = {
						...actionList,
						data,
					};

					dispatch( { type: '%% get data %%', data } );
					dispatch( actionListStepSuccess( newActionList ) );
				},
			};

			const step2 = {
				description: 'Use Data',
				onStep: ( dispatch, actionList ) => {
					dispatch( { type: '%% use data %%', data } );
					dispatch( actionListStepSuccess( actionList ) );
				},
			};

			const actionList = {
				nextSteps: [ step1, step2 ],
			};

			handleStepNext( store, actionListStepNext( actionList ) );

			const annotate1 = store.dispatch.getCall( 0 ).args[ 0 ];
			expect( annotate1.type ).to.equal( WOOCOMMERCE_ACTION_LIST_ANNOTATE );

			const getData = store.dispatch.getCall( 1 ).args[ 0 ];
			expect( getData.type ).to.equal( '%% get data %%' );

			const step1Success = store.dispatch.getCall( 2 ).args[ 0 ];
			expect( step1Success.actionList.currentStep.description ).to.equal( 'Get Data' );
			expect( step1Success.actionList.data ).to.equal( data );

			store.dispatch = spy();
			handleStepSuccess( store, step1Success );

			const annotate2 = store.dispatch.getCall( 0 ).args[ 0 ];
			expect( annotate2.type ).to.equal( WOOCOMMERCE_ACTION_LIST_ANNOTATE );

			const step1Next = store.dispatch.getCall( 1 ).args[ 0 ];
			expect( step1Next.actionList.currentStep ).to.be.null;

			store.dispatch = spy();
			handleStepNext( store, step1Next );

			const annotate3 = store.dispatch.getCall( 0 ).args[ 0 ];
			expect( annotate3.type ).to.equal( WOOCOMMERCE_ACTION_LIST_ANNOTATE );

			const useData = store.dispatch.getCall( 1 ).args[ 0 ];
			expect( useData.data ).to.equal( data );

			const step2Success = store.dispatch.getCall( 2 ).args[ 0 ];
			expect( step2Success.actionList.data ).to.equal( data );
		} );

		test( 'should ignore a next request while a current step is still running.', () => {
			const actionList = {
				prevSteps: [],
				currentStep: fxt.stepA,
				nextSteps: [ fxt.stepB ],
			};

			handleStepNext( store, actionListStepNext( actionList ), fxt.time.stepBStart );

			expect( store.dispatch ).to.not.have.been.called;
		} );

		test( 'should ignore a next request if there are no more steps.', () => {
			const actionList = {
				prevSteps: [ fxt.stepA, fxt.stepB ],
				currentStep: null,
				nextSteps: [],
			};

			handleStepNext( store, actionListStepNext( actionList ), fxt.time.stepCStart );

			expect( store.dispatch ).to.not.have.been.called;
		} );
	} );

	describe( '#handleStepSuccess', () => {
		test( 'should annotate the actionList to the reducer state', () => {
			const actionListBefore = {
				prevSteps: [],
				currentStep: fxt.stepAStarted,
				nextSteps: [ fxt.stepB, fxt.stepC ],
			};

			const actionListAfter = {
				prevSteps: [ fxt.stepASuccessful ],
				currentStep: null,
				nextSteps: [ fxt.stepB, fxt.stepC ],
			};

			handleStepSuccess( store, actionListStepSuccess( actionListBefore ), fxt.time.stepAEnd );

			expect( store.dispatch ).to.have.been.calledWith( actionListAnnotate( actionListAfter ) );
		} );

		test( 'should complete the first step in the list and call middle step', () => {
			const actionListBefore = {
				prevSteps: [],
				currentStep: fxt.stepAStarted,
				nextSteps: [ fxt.stepB, fxt.stepC ],
			};

			const actionListAfter = {
				prevSteps: [ fxt.stepASuccessful ],
				currentStep: null,
				nextSteps: [ fxt.stepB, fxt.stepC ],
			};

			handleStepSuccess( store, actionListStepSuccess( actionListBefore ), fxt.time.stepAEnd );

			expect( store.dispatch ).to.have.been.calledWith( actionListStepNext( actionListAfter ) );
		} );

		test( 'should complete the middle step in the list and call last step', () => {
			const actionListBefore = {
				prevSteps: [ fxt.stepASuccessful ],
				currentStep: fxt.stepBStarted,
				nextSteps: [ fxt.stepC ],
			};

			const actionListAfter = {
				prevSteps: [ fxt.stepASuccessful, fxt.stepBSuccessful ],
				currentStep: null,
				nextSteps: [ fxt.stepC ],
			};

			handleStepSuccess( store, actionListStepSuccess( actionListBefore ), fxt.time.stepBEnd );

			expect( store.dispatch ).to.have.been.calledWith( actionListStepNext( actionListAfter ) );
		} );

		test( 'should run onSuccess after the last step', () => {
			const onSuccess = ( dispatch, actionList ) =>
				dispatch( { type: '%% action list success %%', actionList } );

			const actionListBefore = {
				prevSteps: [ fxt.stepASuccessful, fxt.stepBSuccessful ],
				currentStep: fxt.stepCStarted,
				nextSteps: [],
				onSuccess,
			};

			const actionListAfter = {
				prevSteps: [ fxt.stepASuccessful, fxt.stepBSuccessful, fxt.stepCSuccessful ],
				currentStep: null,
				nextSteps: [],
				onSuccess,
			};

			handleStepSuccess( store, actionListStepSuccess( actionListBefore ), fxt.time.stepCEnd );

			expect( store.dispatch ).to.not.have.been.calledWith(
				match( { type: WOOCOMMERCE_ACTION_LIST_STEP_NEXT } )
			);
			expect( store.dispatch ).to.have.been.calledWith( {
				type: '%% action list success %%',
				actionList: actionListAfter,
			} );
		} );

		test( 'should ignore a success request when there is no current step.', () => {
			const actionList = {
				prevSteps: [ fxt.stepA ],
				currentStep: null,
				nextSteps: [ fxt.stepB ],
			};

			handleStepSuccess( store, actionListStepSuccess( actionList ) );

			expect( store.dispatch ).to.not.have.been.called;
		} );
	} );

	describe( '#handleStepFailure', () => {
		test( 'should annotate the actionList to the reducer state', () => {
			const onFailure = ( dispatch, actionList ) =>
				dispatch( { type: '%% action list failure %%', actionList } );

			const actionListBefore = {
				prevSteps: [ fxt.stepASuccessful ],
				currentStep: fxt.stepEStarted,
				nextSteps: [ fxt.stepC ],
				onFailure,
			};

			const actionListAfter = {
				prevSteps: [ fxt.stepASuccessful, fxt.stepEFailed ],
				currentStep: null,
				nextSteps: [ fxt.stepC ],
				onFailure,
			};

			handleStepFailure(
				store,
				actionListStepFailure( actionListBefore, fxt.stepEError ),
				fxt.time.stepEEnd
			);

			expect( store.dispatch ).to.have.been.calledWith( actionListAnnotate( actionListAfter ) );
		} );

		test( 'should run onFailure after any failure', () => {
			const onFailure = ( dispatch, actionList ) =>
				dispatch( { type: '%% action list failure %%', actionList } );

			const actionListBefore = {
				prevSteps: [ fxt.stepASuccessful ],
				currentStep: fxt.stepEStarted,
				nextSteps: [ fxt.stepC ],
				onFailure,
			};

			const actionListAfter = {
				prevSteps: [ fxt.stepASuccessful, fxt.stepEFailed ],
				currentStep: null,
				nextSteps: [ fxt.stepC ],
				onFailure,
			};

			handleStepFailure(
				store,
				actionListStepFailure( actionListBefore, fxt.stepEError ),
				fxt.time.stepEEnd
			);

			expect( store.dispatch ).to.not.have.been.calledWith(
				match( { type: WOOCOMMERCE_ACTION_LIST_STEP_NEXT } )
			);
			expect( store.dispatch ).to.have.been.calledWith( {
				type: '%% action list failure %%',
				actionList: actionListAfter,
			} );
		} );

		test( 'should ignore a failure request when there is no current step.', () => {
			const actionList = {
				prevSteps: [ fxt.stepA ],
				currentStep: null,
				nextSteps: [ fxt.stepB ],
			};

			handleStepFailure( store, actionListStepFailure( actionList, fxt.stepEError ) );

			expect( store.dispatch ).to.not.have.been.called;
		} );
	} );
} );
