/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import {
	actionListClear,
	actionListStepNext,
	actionListStepAnnotate,
	actionListStepSuccess,
	actionListStepFailure,
} from 'woocommerce/state/action-list/actions';
import {
	handleStepNext,
	handleStepSuccess,
	handleStepFailure,
} from '../';

describe( 'handlers', () => {
	describe( '#handleStepNext', () => {
		it( 'should annotate startTime and the step action', () => {
			const step1Action = { type: '%%Step 1 Action%%' };

			const rootState = {
				extensions: {
					woocommerce: {
						actionList: {
							steps: [
								{ description: 'Step 1', action: step1Action },
							],
						}
					}
				}
			};

			const store = {
				dispatch: spy(),
				getState: () => rootState,
			};

			const action = actionListStepNext( Date.now() );
			const annotationAction = actionListStepAnnotate( 0, { startTime: action.time } );

			handleStepNext( store, action );

			expect( store.dispatch ).to.have.been.calledWith( annotationAction );
			expect( store.dispatch ).to.have.been.calledWith( step1Action );
		} );
	} );

	describe( '#handleStepSuccess', () => {
		it( 'should annotate endTime and start the next step', () => {
			const rootState = {
				extensions: {
					woocommerce: {
						actionList: {
							steps: [
								{ description: 'Step 1', action: { type: '%%1%%' } },
								{ description: 'Step 2', action: { type: '%%2%%' } },
							],
						}
					}
				}
			};

			const store = {
				dispatch: spy(),
				getState: () => rootState,
			};

			const action = actionListStepSuccess( 0, Date.now() );
			const annotationAction = actionListStepAnnotate( 0, { endTime: action.time } );
			const stepNextAction = actionListStepNext( action.time );

			handleStepSuccess( store, action );

			expect( store.dispatch ).to.have.been.calledWith( annotationAction );
			expect( store.dispatch ).to.have.been.calledWith( stepNextAction );
		} );

		it( 'should stop after the last step', () => {
			const step1Start = Date.now() - 300;
			const step1End = Date.now() - 200;
			const step2Start = Date.now() - 100;
			const step2End = Date.now();

			const successAction = { type: '%%SUCCESS%%' };
			const failureAction = { type: '%%FAILURE%%' };

			const rootState = {
				extensions: {
					woocommerce: {
						actionList: {
							steps: [
								{ description: 'Step 1', action: { type: '%%1%%' },
									startTime: step1Start, endTime: step1End },
								{ description: 'Step 2', action: { type: '%%2%%' },
									startTime: step2Start },
							],
							successAction,
							failureAction,
						}
					}
				}
			};

			const store = {
				dispatch: spy(),
				getState: () => rootState,
			};

			const action = actionListStepSuccess( 1, step2End );
			const annotationAction = actionListStepAnnotate( 1, { endTime: step2End } );
			const stepNextAction = actionListStepNext( action.time );

			handleStepSuccess( store, action );

			expect( store.dispatch ).to.have.been.called.once;
			expect( store.dispatch ).to.have.been.calledWith( annotationAction );
			expect( store.dispatch ).to.not.have.been.calledWith( stepNextAction );
			expect( store.dispatch ).to.have.been.calledWith( successAction );
		} );

		it( 'should clear action-list after success if clearUponComplete is specified', () => {
			const step1Start = Date.now() - 300;
			const step1End = Date.now() - 200;

			const rootState = {
				extensions: {
					woocommerce: {
						actionList: {
							steps: [
								{ description: 'Step 1', action: { type: '%%1%%' },
									startTime: step1Start },
							],
							clearUponComplete: true,
						}
					}
				}
			};

			const store = {
				dispatch: spy(),
				getState: () => rootState,
			};

			const action = actionListStepSuccess( 0, step1End );
			const annotationAction = actionListStepAnnotate( 0, { endTime: step1End } );
			const stepNextAction = actionListStepNext( action.time );
			const clearAction = actionListClear();

			handleStepSuccess( store, action );

			expect( store.dispatch ).to.have.been.calledWith( annotationAction );
			expect( store.dispatch ).to.not.have.been.calledWith( stepNextAction );
			expect( store.dispatch ).to.have.been.calledWith( clearAction );
		} );
	} );

	describe( '#handleStepFailure', () => {
		it( 'should annotate endTime and error', () => {
			const successAction = { type: '%%SUCCESS%%' };
			const failureAction = { type: '%%FAILURE%%' };

			const rootState = {
				extensions: {
					woocommerce: {
						actionList: {
							steps: [
								{ description: 'Step 1', action: { type: '%%1%%' } },
								{ description: 'Step 2', action: { type: '%%2%%' } },
							],
							successAction,
							failureAction,
						}
					}
				}
			};

			const store = {
				dispatch: spy(),
				getState: () => rootState,
			};

			const error = 'This is an error';
			const action = actionListStepFailure( 0, error, Date.now() );
			const annotationAction = actionListStepAnnotate( 0, { error, endTime: action.time } );

			handleStepFailure( store, action );

			expect( store.dispatch ).to.have.been.calledWith( annotationAction );
			expect( store.dispatch ).to.have.been.calledWith( failureAction );
		} );

		it( 'should clear action-list after failure if clearUponComplete is specified', () => {
			const rootState = {
				extensions: {
					woocommerce: {
						actionList: {
							steps: [
								{ description: 'Step 1', action: { type: '%%1%%' } },
							],
							clearUponComplete: true,
						}
					}
				}
			};

			const store = {
				dispatch: spy(),
				getState: () => rootState,
			};

			const error = 'This is an error';
			const action = actionListStepFailure( 0, error, Date.now() );
			const annotationAction = actionListStepAnnotate( 0, { error, endTime: action.time } );
			const clearAction = actionListClear();

			handleStepFailure( store, action );

			expect( store.dispatch ).to.have.been.calledWith( annotationAction );
			expect( store.dispatch ).to.have.been.calledWith( clearAction );
		} );
	} );
} );

