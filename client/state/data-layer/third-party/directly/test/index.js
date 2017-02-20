/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import * as directly from 'lib/directly';
import {
	DIRECTLY_ASK_QUESTION,
	DIRECTLY_INITIALIZE,
} from 'state/action-types';
import {
	askQuestion,
	initialize,
} from '..';

describe( 'Directly data layer', () => {
	let next;
	let store;

	useSandbox( ( sandbox ) => {
		next = sandbox.spy();
		store = {
			dispatch: sandbox.spy(),
		};
		// Stub in all lib/directly functions to avoid them being actually called
		sandbox.stub( directly, 'askQuestion' );
		sandbox.stub( directly, 'initialize' );
	} );

	describe( '#askQuestion', () => {
		const questionText = 'To be or not to be?';
		const name = 'Hamlet';
		const email = 'hammie@royalfamily.dk';
		const action = { type: DIRECTLY_ASK_QUESTION, questionText, name, email };

		it( 'should invoke the corresponding Directly function', () => {
			askQuestion( store, action, next );
			expect( directly.askQuestion ).to.have.been.calledWith( questionText, name, email );
		} );

		it( 'should pass the action through', () => {
			askQuestion( store, action, next );
			expect( next ).to.have.been.calledWith( action );
		} );
	} );

	describe( '#initialize', () => {
		const action = { type: DIRECTLY_INITIALIZE };

		it( 'should invoke the corresponding Directly function', () => {
			initialize( store, action, next );
			expect( directly.initialize ).to.have.been.calledOnce;
		} );

		it( 'should pass the action through', () => {
			initialize( store, action, next );
			expect( next ).to.have.been.calledWith( action );
		} );
	} );
} );
