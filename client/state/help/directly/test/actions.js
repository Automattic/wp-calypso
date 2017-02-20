/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	askQuestion,
	initialize,
} from '../actions';
import {
	DIRECTLY_ASK_QUESTION,
	DIRECTLY_INITIALIZE,
} from 'state/action-types';

describe( 'actions', () => {
	describe( '#askQuestion()', () => {
		const questionText = 'To be or not to be?';
		const name = 'Hamlet';
		const email = 'hammie@royalfamily.dk';

		it( 'returns an action with appropriate type and question parameters', () => {
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
		it( 'returns an action with appropriate type', () => {
			const action = initialize();
			expect( action ).to.eql( { type: DIRECTLY_INITIALIZE } );
		} );
	} );
} );
