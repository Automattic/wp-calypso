/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';

import {
	createApiPlan,
	startApiPlanStep,
	endApiPlanStep,
	clearApiPlan,
} from '../actions';

describe( 'reducer', () => {
	it( 'should initialize to null', () => {
		expect( reducer( undefined, { type: 'DUMMY_ACTION' } ) ).to.equal( null );
	} );

	it( 'should create a plan', () => {
		const plan = [
			{ name: 'Step 1', operation: { name: 'doStepOne', id: 1 } },
			{ name: 'Step 2', operation: { name: 'doStepTwo', id: 2 } },
			{ name: 'Step 3', operation: { name: 'doStepThree', id: 3 } },
		];

		expect( reducer( undefined, createApiPlan( plan ) ) ).to.equal( plan );
	} );

	it( 'should start a step', () => {
		const step0Start = Date.now();
		const plan = [
			{ name: 'Step 1', operation: { name: 'doStepOne', id: 1 } },
			{ name: 'Step 2', operation: { name: 'doStepTwo', id: 2 } },
			{ name: 'Step 3', operation: { name: 'doStepThree', id: 3 } },
		];

		const state1 = reducer( undefined, createApiPlan( plan ) );
		const state2 = reducer( state1, startApiPlanStep( 0, step0Start ) );

		expect( state1 ).to.equal( plan );
		expect( state2[ 0 ].startTime ).to.equal( step0Start );
	} );

	it( 'should end a step', () => {
		const step0Start = Date.now() - 200;
		const step0End = Date.now();
		const plan = [
			{ name: 'Step 1', operation: { name: 'doStepOne', id: 1 }, startTime: step0Start },
			{ name: 'Step 2', operation: { name: 'doStepTwo', id: 2 } },
			{ name: 'Step 3', operation: { name: 'doStepThree', id: 3 } },
		];

		const state1 = reducer( undefined, createApiPlan( plan ) );
		const state2 = reducer( state1, endApiPlanStep( 0, 'success', step0End ) );

		expect( state1 ).to.equal( plan );
		expect( state2[ 0 ].startTime ).to.equal( step0Start );
		expect( state2[ 0 ].result ).to.equal( 'success' );
		expect( state2[ 0 ].endTime ).to.equal( step0End );
	} );

	it( 'should clear the plan', () => {
		const plan = [
			{ name: 'Step 1', operation: { name: 'doStepOne', id: 1 } },
			{ name: 'Step 2', operation: { name: 'doStepTwo', id: 2 } },
			{ name: 'Step 3', operation: { name: 'doStepThree', id: 3 } },
		];

		const state1 = reducer( undefined, createApiPlan( plan ) );
		const state2 = reducer( state1, clearApiPlan() );

		expect( state1 ).to.equal( plan );
		expect( state2 ).to.equal( null );
	} );
} );

