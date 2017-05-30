/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';

import {
	apiPlanCreate,
	apiPlanClear,
	apiPlanStepStarted,
	apiPlanStepEnded,
} from '../actions';

describe( 'reducer', () => {
	it( 'should initialize to null', () => {
		expect( reducer( undefined, { type: 'DUMMY_ACTION' } ) ).to.equal( null );
	} );

	it( 'should create a plan', () => {
		const plan = [
			{ description: 'Do Step 1', operation: { name: 'doStepOne', id: 1 } },
			{ description: 'Do Step 2', operation: { name: 'doStepTwo', id: 2 } },
			{ description: 'Do Step 3', operation: { name: 'doStepThree', id: 3 } },
		];

		expect( reducer( undefined, apiPlanCreate( plan ) ) ).to.equal( plan );
	} );

	it( 'should start a step', () => {
		const step0Start = Date.now();
		const plan = [
			{ description: 'Do Step 1', operation: { name: 'doStepOne', id: 1 } },
			{ description: 'Do Step 2', operation: { name: 'doStepTwo', id: 2 } },
			{ description: 'Do Step 3', operation: { name: 'doStepThree', id: 3 } },
		];

		const state1 = reducer( undefined, apiPlanCreate( plan ) );
		const state2 = reducer( state1, apiPlanStepStarted( 0, step0Start ) );

		expect( state1 ).to.equal( plan );
		expect( state2[ 0 ].startTime ).to.equal( step0Start );
	} );

	it( 'should end a step successfully', () => {
		const step0Start = Date.now() - 200;
		const step0End = Date.now();
		const plan = [
			{ description: 'Do Step 1', operation: { name: 'doStepOne', id: 1 } },
			{ description: 'Do Step 2', operation: { name: 'doStepTwo', id: 2 } },
			{ description: 'Do Step 3', operation: { name: 'doStepThree', id: 3 } },
		];

		const state1 = reducer( undefined, apiPlanCreate( plan ) );
		const state2 = reducer( state1, apiPlanStepStarted( 0, step0Start ) );
		const state3 = reducer( state2, apiPlanStepEnded( 0, undefined, step0End ) );

		expect( state1 ).to.equal( plan );
		expect( state3[ 0 ].startTime ).to.equal( step0Start );
		expect( state3[ 0 ].error ).to.not.exist;
		expect( state3[ 0 ].endTime ).to.equal( step0End );
	} );

	it( 'should end a step with an error', () => {
		const step0Start = Date.now() - 200;
		const step0End = Date.now();
		const plan = [
			{ description: 'Do Step 1', operation: { name: 'doStepOne', id: 1 } },
			{ description: 'Do Step 2', operation: { name: 'doStepTwo', id: 2 } },
			{ description: 'Do Step 3', operation: { name: 'doStepThree', id: 3 } },
		];
		const error = {
			code: 404,
			message: 'Not found',
		};

		const state1 = reducer( undefined, apiPlanCreate( plan ) );
		const state2 = reducer( state1, apiPlanStepStarted( 0, step0Start ) );
		const state3 = reducer( state2, apiPlanStepEnded( 0, error, step0End ) );

		expect( state1 ).to.equal( plan );
		expect( state3[ 0 ].startTime ).to.equal( step0Start );
		expect( state3[ 0 ].error ).to.equal( error );
		expect( state3[ 0 ].endTime ).to.equal( step0End );
	} );

	it( 'should clear the plan', () => {
		const plan = [
			{ description: 'Do Step 1', operation: { name: 'doStepOne', id: 1 } },
			{ description: 'Do Step 2', operation: { name: 'doStepTwo', id: 2 } },
			{ description: 'Do Step 3', operation: { name: 'doStepThree', id: 3 } },
		];

		const state1 = reducer( undefined, apiPlanCreate( plan ) );
		const state2 = reducer( state1, apiPlanClear() );

		expect( state1 ).to.equal( plan );
		expect( state2 ).to.equal( null );
	} );
} );

