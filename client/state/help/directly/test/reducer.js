/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	STATUS_UNINITIALIZED,
	STATUS_INITIALIZING,
	STATUS_READY,
	STATUS_ERROR,
} from '../constants';
import reducer, { questionAsked, status } from '../reducer';
import {
	DIRECTLY_ASK_QUESTION,
	DIRECTLY_INITIALIZATION_START,
	DIRECTLY_INITIALIZATION_SUCCESS,
	DIRECTLY_INITIALIZATION_ERROR,
} from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'questionAsked', 'status' ] );
	} );

	describe( '#questionAsked()', () => {
		test( 'should default to null', () => {
			const state = questionAsked( undefined, {} );
			expect( state ).to.eql( null );
		} );

		test( 'should set once a question is asked', () => {
			const questionText =
				'What is the answer to the ultimate question of life, the universe, and everything?';
			const name = 'Douglas Adams';
			const email = 'doug@hhguide.com';
			const action = { type: DIRECTLY_ASK_QUESTION, questionText, name, email };
			const state = questionAsked( undefined, action );
			expect( state ).to.eql( { questionText, name, email } );
		} );
	} );

	describe( '#status()', () => {
		test( 'should default to uninitialized state', () => {
			const state = status( undefined, {} );
			expect( state ).to.eql( STATUS_UNINITIALIZED );
		} );

		test( 'should mark when initialization starts', () => {
			const state = status( undefined, { type: DIRECTLY_INITIALIZATION_START } );
			expect( state ).to.eql( STATUS_INITIALIZING );
		} );

		test( 'should mark when initialization completes', () => {
			const state = status( undefined, { type: DIRECTLY_INITIALIZATION_SUCCESS } );
			expect( state ).to.eql( STATUS_READY );
		} );

		test( 'should mark when initialization fails', () => {
			const state = status( undefined, { type: DIRECTLY_INITIALIZATION_ERROR } );
			expect( state ).to.eql( STATUS_ERROR );
		} );
	} );
} );
