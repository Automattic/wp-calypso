/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';

import {
	actionListCreate,
	actionListClear,
	actionListStepAnnotate,
} from '../actions';

describe( 'reducer', () => {
	it( 'should initialize to null', () => {
		expect( reducer( undefined, { type: 'DUMMY_ACTION' } ) ).to.equal( null );
	} );

	it( 'should create an action list', () => {
		const actionList = {
			steps: [
				{ description: 'Do Step 1', action: { type: '%%1%%', id: 1 } },
				{ description: 'Do Step 2', action: { type: '%%2%%', id: 2 } },
				{ description: 'Do Step 3', action: { type: '%%3%%', id: 3 } },
			],
			successAction: { type: '%%SUCCESS%%' },
			failureAction: { type: '%%FAILURE%%' },
		};

		expect( reducer( undefined, actionListCreate( actionList ) ) ).to.equal( actionList );
	} );

	it( 'should annotate a step', () => {
		const step0Start = Date.now() - 200;
		const step0End = Date.now();
		const step0Error = 'This is an error';

		const actionList = {
			steps: [
				{ description: 'Do Step 1', action: { type: '%%1%%', id: 1 } },
				{ description: 'Do Step 2', action: { type: '%%2%%', id: 2 } },
				{ description: 'Do Step 3', action: { type: '%%3%%', id: 3 } },
			],
		};

		const state1 = reducer( undefined, actionListCreate( actionList ) );
		const state2 = reducer( state1, actionListStepAnnotate( 0, { startTime: step0Start } ) );
		const state3 = reducer( state2, actionListStepAnnotate( 0, { endTime: step0End, error: step0Error } ) );

		expect( state1 ).to.equal( actionList );
		expect( state2.steps[ 0 ].startTime ).to.equal( step0Start );
		expect( state2.steps[ 0 ].endTime ).to.not.exist;
		expect( state3.steps[ 0 ].startTime ).to.equal( step0Start );
		expect( state3.steps[ 0 ].endTime ).to.equal( step0End );
		expect( state3.steps[ 0 ].error ).to.equal( step0Error );
	} );

	it( 'should clear the actionList', () => {
		const actionList = {
			steps: [
				{ description: 'Do Step 1', operation: { name: 'doStepOne', id: 1 } },
				{ description: 'Do Step 2', operation: { name: 'doStepTwo', id: 2 } },
				{ description: 'Do Step 3', operation: { name: 'doStepThree', id: 3 } },
			],
			successAction: { type: '%%SUCCESS%%' },
			failureAction: { type: '%%FAILURE%%' },
		};

		const state1 = reducer( undefined, actionListCreate( actionList ) );
		const state2 = reducer( state1, actionListClear() );

		expect( state1 ).to.equal( actionList );
		expect( state2 ).to.equal( null );
	} );
} );

