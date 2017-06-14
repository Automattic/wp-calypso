/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { actionListStepStart, actionListStepSuccess } from 'woocommerce/state/action-list/actions';
import {
	handleStepStart,
	handleStepSuccess,
} from '../';

describe( 'handlers', () => {
	describe( '#handleStepStart', () => {
		it( 'should dispatch step action', () => {
			const step1Action = { type: '%%Step 1 Action%%' };

			const rootState = {
				extensions: {
					woocommerce: {
						actionList: [
							{ description: 'Step 1', action: step1Action },
						],
					}
				}
			};

			const store = {
				dispatch: spy(),
				getState: () => rootState,
			};

			const action = actionListStepStart();
			handleStepStart( store, action );

			expect( store.dispatch ).to.have.been.calledWith( step1Action );
		} );
	} );

	describe( '#handleStepSuccess', () => {
		it( 'should start the next step', () => {
			const rootState = {
				extensions: {
					woocommerce: {
						actionList: [
							{ description: 'Step 1', action: { type: '%%1%%' } },
							{ description: 'Step 2', action: { type: '%%2%%' } },
						],
					}
				}
			};

			const store = {
				dispatch: spy(),
				getState: () => rootState,
			};

			const action = actionListStepSuccess( 0 );
			const expectedAction = actionListStepStart( 1, action.time );

			handleStepSuccess( store, action );

			expect( store.dispatch ).to.have.been.calledWith( expectedAction );
		} );

		it( 'should stop after the last step', () => {
			const rootState = {
				extensions: {
					woocommerce: {
						actionList: [
							{ description: 'Step 1', action: { type: '%%1%%' } },
							{ description: 'Step 2', action: { type: '%%2%%' } },
						],
					}
				}
			};

			const store = {
				dispatch: spy(),
				getState: () => rootState,
			};

			const action = actionListStepStart( 1 );
			handleStepSuccess( store, action );

			expect( store.dispatch ).to.not.have.been.called;
		} );
	} );
} );

