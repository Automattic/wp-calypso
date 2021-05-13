/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { askQuestion, initialize, initializationCompleted, initializationFailed } from '../actions';
import {
	DIRECTLY_ASK_QUESTION,
	DIRECTLY_INITIALIZATION_START,
	DIRECTLY_INITIALIZATION_SUCCESS,
	DIRECTLY_INITIALIZATION_ERROR,
} from 'calypso/state/action-types';

describe( 'actions', () => {
	describe( '#askQuestion()', () => {
		const questionText = 'To be or not to be?';
		const name = 'Hamlet';
		const email = 'hammie@royalfamily.dk';

		test( 'returns an action with appropriate type and question parameters', () => {
			const action = askQuestion( questionText, name, email );
			expect( action ).to.eql( {
				type: DIRECTLY_ASK_QUESTION,
				questionText,
				name,
				email,
			} );
		} );
	} );

	describe( '#initialize()', () => {
		test( 'returns an action with appropriate type', () => {
			const action = initialize();
			expect( action ).to.eql( { type: DIRECTLY_INITIALIZATION_START } );
		} );
	} );

	describe( '#initializationCompleted()', () => {
		test( 'returns an action with appropriate type', () => {
			const action = initializationCompleted();
			expect( action ).to.eql( { type: DIRECTLY_INITIALIZATION_SUCCESS } );
		} );
	} );

	describe( '#initializationFailed()', () => {
		test( 'returns an action with appropriate type', () => {
			const action = initializationFailed();
			expect( action ).to.eql( { type: DIRECTLY_INITIALIZATION_ERROR } );
		} );
	} );
} );
