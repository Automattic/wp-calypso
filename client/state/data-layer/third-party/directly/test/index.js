/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import * as analytics from 'state/analytics/actions';
import * as directly from 'lib/directly';
import {
	DIRECTLY_ASK_QUESTION,
	DIRECTLY_INITIALIZATION_SUCCESS,
	DIRECTLY_INITIALIZATION_ERROR,
} from 'state/action-types';
import { askQuestion, initialize } from '..';

describe( 'Directly data layer', () => {
	let store;
	let simulateInitializationSuccess;
	let simulateInitializationError;

	useSandbox( sandbox => {
		store = {
			dispatch: sandbox.spy(),
		};
		// Stub in all lib/directly functions to avoid them being actually called
		sandbox.stub( directly, 'askQuestion' );
		sandbox.stub( directly, 'initialize' );

		sandbox.spy( analytics, 'recordTracksEvent' );
	} );

	beforeEach( () => {
		// Mock out a Promise that can be resolved or rejected in each test to simulate
		// Directly's library initializing or having an error
		directly.initialize.returns(
			new Promise( ( resolve, reject ) => {
				simulateInitializationSuccess = resolve;
				simulateInitializationError = reject;
			} )
		);
	} );

	describe( '#askQuestion', () => {
		const questionText = 'To be or not to be?';
		const name = 'Hamlet';
		const email = 'hammie@royalfamily.dk';
		const action = { type: DIRECTLY_ASK_QUESTION, questionText, name, email };

		beforeEach( () => {
			directly.askQuestion.returns( Promise.resolve() );
		} );

		it( 'should invoke the corresponding Directly function', () => {
			askQuestion( store, action );
			expect( directly.askQuestion ).to.have.been.calledWith( questionText, name, email );
		} );

		it( 'should dispatch an analytics event', () =>
			askQuestion( store, action ).then( () =>
				expect( analytics.recordTracksEvent ).to.have.been.calledWith(
					'calypso_directly_ask_question'
				)
			) );
	} );

	describe( '#initialize', () => {
		it( 'should invoke the corresponding Directly function', () => {
			initialize( store );
			expect( directly.initialize ).to.have.been.calledOnce;
		} );

		it( 'should dispatch an analytics event once initialization starts', () => {
			initialize( store );
			expect( analytics.recordTracksEvent ).to.have.been.calledWith(
				'calypso_directly_initialization_start'
			);
		} );

		it( 'should dispatch a success action if initialization completes', done => {
			initialize( store )
				.then( () =>
					expect( store.dispatch ).to.have.been.calledWithMatch( {
						type: DIRECTLY_INITIALIZATION_SUCCESS,
					} )
				)
				.then( () => done() );

			simulateInitializationSuccess();
		} );

		it( 'should dispatch an analytics event if initialization completes', done => {
			initialize( store )
				.then( () =>
					expect( analytics.recordTracksEvent ).to.have.been.calledWith(
						'calypso_directly_initialization_success'
					)
				)
				.then( () => done() );

			simulateInitializationSuccess();
		} );

		it( 'should dispatch an error action if initialization fails', done => {
			initialize( store )
				.then( () =>
					expect( store.dispatch ).to.have.been.calledWithMatch( {
						type: DIRECTLY_INITIALIZATION_ERROR,
					} )
				)
				.then( () => done() );

			simulateInitializationError();
		} );

		it( 'should dispatch an analytics event if initialization fails', done => {
			initialize( store )
				.then( () =>
					expect(
						analytics.recordTracksEvent
					).to.have.been.calledWith( 'calypso_directly_initialization_error', {
						error: 'Error: Something went wrong',
					} )
				)
				.then( () => done() );

			simulateInitializationError( new Error( 'Something went wrong' ) );
		} );
	} );
} );
