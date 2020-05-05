/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { actionListClear, actionListAnnotate } from '../actions';
import reducer from '../reducer';
import * as fxt from 'woocommerce/state/action-list/test/fixtures';

describe( 'reducer', () => {
	test( 'should initialize to null', () => {
		expect( reducer( undefined, { type: 'DUMMY_ACTION' } ) ).to.equal( null );
	} );

	test( 'should show action list progress after step started', () => {
		const actionList = {
			prevSteps: [ fxt.stepASuccessful ],
			currentStep: fxt.stepBStarted,
			nextSteps: [ fxt.stepC ],
		};

		const expectedState = {
			prevSteps: [
				{
					description: fxt.stepA.description,
					startTime: fxt.time.stepAStart,
					endTime: fxt.time.stepAEnd,
				},
			],
			currentStep: { description: fxt.stepB.description, startTime: fxt.time.stepBStart },
			nextSteps: [ { description: fxt.stepC.description } ],
		};

		expect( reducer( undefined, actionListAnnotate( actionList ) ) ).to.eql( expectedState );
	} );

	test( 'should show action list progress after step success', () => {
		const actionList = {
			prevSteps: [ fxt.stepASuccessful, fxt.stepBSuccessful ],
			currentStep: null,
			nextSteps: [ fxt.stepC ],
		};

		const expectedState = {
			prevSteps: [
				{
					description: fxt.stepA.description,
					startTime: fxt.time.stepAStart,
					endTime: fxt.time.stepAEnd,
				},
				{
					description: fxt.stepB.description,
					startTime: fxt.time.stepBStart,
					endTime: fxt.time.stepBEnd,
				},
			],
			currentStep: null,
			nextSteps: [ { description: fxt.stepC.description } ],
		};

		expect( reducer( undefined, actionListAnnotate( actionList ) ) ).to.eql( expectedState );
	} );

	test( 'should clear the actionList', () => {
		const actionList = {
			prevSteps: [ fxt.stepASuccessful, fxt.stepASuccessful, fxt.stepCSuccessful ],
			currentStep: null,
			nextSteps: [],
		};

		const state1 = reducer( undefined, actionListAnnotate( actionList ) );
		const state2 = reducer( state1, actionListClear() );

		expect( state2 ).to.be.null;
	} );
} );
