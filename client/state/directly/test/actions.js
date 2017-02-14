/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import directly from 'lib/directly';
import {
	askQuestion,
	initialize,
	maximize,
	minimize,
	openAskForm,
} from '../actions';
import {
	DIRECTLY_ASKING_QUESTION,
	DIRECTLY_INITIALIZING,
	DIRECTLY_INITIALIZED,
	DIRECTLY_INITIALIZATION_ERROR,
	DIRECTLY_MAXIMIZING,
	DIRECTLY_MINIMIZING,
	DIRECTLY_OPENING_ASK_FORM,
} from 'state/action-types';

describe( 'actions', () => {
	const sandbox = sinon.sandbox.create();
	const dispatchSpy = sandbox.spy();

	// Stub in all lib/directly functions to avoid them being actually called
	sandbox.stub( directly, 'askQuestion' );
	sandbox.stub( directly, 'initialize' );
	sandbox.stub( directly, 'maximize' );
	sandbox.stub( directly, 'minimize' );
	sandbox.stub( directly, 'openAskForm' );

	afterEach( () => {
		sandbox.reset();
	} );

	after( () => {
		sandbox.restore();
	} );

	describe( '#askQuestion()', () => {
		const questionParams = {
			questionText: 'To be or not to be?',
			name: 'Hamlet',
			email: 'hammie@royalfamily.dk',
		};

		it( 'immediately dispatches an action with appropriate type and question parameters', () => {
			askQuestion( questionParams )( dispatchSpy );
			expect( dispatchSpy ).to.have.been.calledWith( {
				type: DIRECTLY_ASKING_QUESTION,
				questionText: questionParams.questionText,
				name: questionParams.name,
				email: questionParams.email,
			} );
		} );

		it( 'invokes askQuestion() from lib/directly and passes the question parameters', () => {
			askQuestion( questionParams )( dispatchSpy );
			expect( directly.askQuestion ).to.have.been.calledWith( questionParams );
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
				type: DIRECTLY_INITIALIZING,
				config
			} );
		} );

		it( 'invokes initialize() from lib/directly and passes the config', () => {
			initialize( config )( dispatchSpy );
			expect( directly.initialize ).to.have.been.calledWith( config );
		} );

		it( 'dispatches a success action when initialization completes', () => {
			initialize( config )( dispatchSpy );
			// Grab the callback which was passed into directly.initialize( config, callback )
			const initializationCallback = directly.initialize.lastCall.args[ 1 ];
			// Invoke the callback with no parameters, indicating success
			initializationCallback();
			expect( dispatchSpy ).to.have.been.calledWith( {
				type: DIRECTLY_INITIALIZED
			} );
		} );

		it( 'dispatches an error action when initialization fails', () => {
			const error = { src: '/path/to/script.js' };
			initialize( config )( dispatchSpy );
			// Grab the callback which was passed into directly.initialize( config, callback )
			const initializationCallback = directly.initialize.lastCall.args[ 1 ];
			// Invoke the callback with no parameters, indicating success
			initializationCallback( error );
			expect( dispatchSpy ).to.have.been.calledWith( {
				type: DIRECTLY_INITIALIZATION_ERROR,
				error
			} );
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
