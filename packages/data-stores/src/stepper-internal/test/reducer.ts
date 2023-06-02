/*
 * These tests shouldn't require the jsdom environment,
 * but we're waiting for this PR to merge:
 * https://github.com/WordPress/gutenberg/pull/20486
 *
 * @jest-environment jsdom
 */

import { stepData } from '../reducer';

describe( 'StepperInternal reducer', () => {
	it( 'returns the correct default state', () => {
		const state = stepData( null, { type: 'TEST_ACTION' } );
		expect( state ).toEqual( null );
	} );

	it( 'returns stepper data', () => {
		const data = { message: 'test' };

		const state = stepData( null, {
			type: 'SET_STEP_DATA',
			data,
		} );
		expect( state ).toEqual( data );
	} );

	it( 'clears stepper data', () => {
		const state = stepData( null, {
			type: 'CLEAR_STEP_DATA',
		} );
		expect( state ).toEqual( null );
	} );
} );
