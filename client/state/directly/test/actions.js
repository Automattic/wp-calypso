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
	askQuestion,
	initialize,
	maximize,
	minimize,
	openAskForm,
} from '../actions';
import {
	DIRECTLY_ASK_QUESTION,
	DIRECTLY_INITIALIZED,
	DIRECTLY_MAXIMIZING,
	DIRECTLY_MINIMIZING,
	DIRECTLY_OPENING_ASK_FORM,
} from 'state/action-types';

describe( 'actions', () => {
	let dispatchSpy;

	useSandbox( ( sandbox ) => {
		dispatchSpy = sandbox.spy();
		// Stub in all lib/directly functions to avoid them being actually called
		sandbox.stub( directly, 'askQuestion' );
		sandbox.stub( directly, 'initialize' );
		sandbox.stub( directly, 'maximize' );
		sandbox.stub( directly, 'minimize' );
		sandbox.stub( directly, 'openAskForm' );
	} );

	describe( '#askQuestion()', () => {
		const questionText = 'To be or not to be?';
		const name = 'Hamlet';
		const email = 'hammie@royalfamily.dk';

		it( 'immediately dispatches an action with appropriate type and question parameters', () => {
			askQuestion( questionText, name, email )( dispatchSpy );
			expect( dispatchSpy ).to.have.been.calledWith( {
				type: DIRECTLY_ASK_QUESTION,
				questionText,
				name,
				email,
			} );
		} );

		it( 'invokes askQuestion() from lib/directly and passes the question parameters', () => {
			askQuestion( questionText, name, email )( dispatchSpy );
			expect( directly.askQuestion ).to.have.been.calledWith( questionText, name, email );
		} );
	} );

	describe( '#initialize()', () => {
		const config = {
			displayAskQuestion: true,
			questionCategory: 'toBeOrNotToBe',
			metadata: {
				quote: 'Something is rotten in the state of Denmark',
			},
			userName: 'Hamlet',
			userEmail: 'hammie@royalfamily.dk.com',
		};

		it( 'immediately dispatches an action with appropriate type', () => {
			initialize( config )( dispatchSpy );
			expect( dispatchSpy ).to.have.been.calledWith( {
				type: DIRECTLY_INITIALIZED,
				config
			} );
		} );

		it( 'invokes initialize() from lib/directly and passes the config', () => {
			initialize( config )( dispatchSpy );
			expect( directly.initialize ).to.have.been.calledWith( config );
		} );
	} );

	describe( '#maximize()', () => {
		it( 'immediately dispatches an action with appropriate type', () => {
			maximize()( dispatchSpy );
			expect( dispatchSpy ).to.have.been.calledWith( {
				type: DIRECTLY_MAXIMIZING
			} );
		} );

		it( 'invokes maximize() from lib/directly', () => {
			maximize()( dispatchSpy );
			expect( directly.maximize ).to.have.been.called.once;
		} );
	} );

	describe( '#minimize()', () => {
		it( 'immediately dispatches an action with appropriate type', () => {
			minimize()( dispatchSpy );
			expect( dispatchSpy ).to.have.been.calledWith( {
				type: DIRECTLY_MINIMIZING
			} );
		} );

		it( 'invokes minimize() from lib/directly', () => {
			minimize()( dispatchSpy );
			expect( directly.minimize ).to.have.been.called.once;
		} );
	} );

	describe( '#openAskForm()', () => {
		it( 'immediately dispatches an action with appropriate type', () => {
			openAskForm()( dispatchSpy );
			expect( dispatchSpy ).to.have.been.calledWith( {
				type: DIRECTLY_OPENING_ASK_FORM
			} );
		} );

		it( 'invokes openAskForm() from lib/directly', () => {
			openAskForm()( dispatchSpy );
			expect( directly.openAskForm ).to.have.been.called.once;
		} );
	} );
} );
