import {
	DIRECTLY_ASK_QUESTION,
	DIRECTLY_INITIALIZATION_START,
	DIRECTLY_INITIALIZATION_SUCCESS,
	DIRECTLY_INITIALIZATION_ERROR,
} from 'calypso/state/action-types';
import {
	STATUS_UNINITIALIZED,
	STATUS_INITIALIZING,
	STATUS_READY,
	STATUS_ERROR,
} from '../constants';
import reducer, { questionAsked, status } from '../reducer';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual( [ 'questionAsked', 'status' ] );
	} );

	describe( '#questionAsked()', () => {
		test( 'should default to null', () => {
			const state = questionAsked( undefined, {} );
			expect( state ).toBeNull();
		} );

		test( 'should set to true once a question is asked', () => {
			const state = questionAsked( undefined, { type: DIRECTLY_ASK_QUESTION } );
			expect( state ).toBe( true );
		} );
	} );

	describe( '#status()', () => {
		test( 'should default to uninitialized state', () => {
			const state = status( undefined, {} );
			expect( state ).toBe( STATUS_UNINITIALIZED );
		} );

		test( 'should mark when initialization starts', () => {
			const state = status( undefined, { type: DIRECTLY_INITIALIZATION_START } );
			expect( state ).toBe( STATUS_INITIALIZING );
		} );

		test( 'should mark when initialization completes', () => {
			const state = status( undefined, { type: DIRECTLY_INITIALIZATION_SUCCESS } );
			expect( state ).toBe( STATUS_READY );
		} );

		test( 'should mark when initialization fails', () => {
			const state = status( undefined, { type: DIRECTLY_INITIALIZATION_ERROR } );
			expect( state ).toBe( STATUS_ERROR );
		} );
	} );
} );
