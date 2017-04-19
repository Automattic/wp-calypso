/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { getData, getError, getProgress, dispatchRequest } from '../utils.js';

describe( 'WPCOM HTTP Data Layer', () => {
	describe( 'Utils', () => {
		describe( '#getData', () => {
			it( 'should return successful response data if available', () => {
				const data = { utterance: 'Bork bork' };
				const action = { type: 'SLUGGER', meta: { dataLayer: { data } } };

				expect( getData( action ) ).to.equal( data );
			} );

			it( 'should return null if no response data available', () => {
				const action = { type: 'SLUGGER' };

				expect( getData( action ) ).to.be.null;
			} );
		} );

		describe( '#getError', () => {
			it( 'should return failing error data if available', () => {
				const error = { utterance: 'Bork bork' };
				const action = { type: 'SLUGGER', meta: { dataLayer: { error } } };

				expect( getError( action ) ).to.equal( error );
			} );

			it( 'should return null if no error data available', () => {
				const action = { type: 'SLUGGER' };

				expect( getError( action ) ).to.be.null;
			} );
		} );

		describe( '#getProgress', () => {
			it( 'should return progress data if available', () => {
				const progress = { total: 1234, loaded: 123 };
				const action = { type: 'UPLOAD_PROGRESS', meta: { dataLayer: { progress } } };

				expect( getProgress( action ) ).to.equal( progress );
			} );
		} );

		describe( '#dispatchRequest', () => {
			const data = { count: 5 };
			const error = { message: 'oh no!' };
			const empty = { type: 'REFILL' };
			const progressInfo = { loaded: 45, total: 80 };
			const success = { type: 'REFILL', meta: { dataLayer: { data } } };
			const failure = { type: 'REFILL', meta: { dataLayer: { error } } };
			const progress = { type: 'REFILL', meta: { dataLayer: { progress: progressInfo } } };
			const both = { type: 'REFILL', meta: { dataLayer: { data, error } } };

			let initiator;
			let onSuccess;
			let onFailure;
			let onProgress;
			let dispatcher;
			let store;
			let next;

			beforeEach( () => {
				initiator = spy();
				onSuccess = spy();
				onFailure = spy();
				onProgress = spy();
				dispatcher = dispatchRequest( initiator, onSuccess, onFailure, onProgress );
				store = spy();
				next = spy();
			} );

			it( 'should call the initiator if meta information missing', () => {
				dispatcher( store, empty, next );

				expect( initiator ).to.have.been.calledWith( store, empty, next );
				expect( onSuccess ).to.not.have.beenCalled;
				expect( onFailure ).to.not.have.beenCalled;
				expect( onProgress ).to.not.have.beenCalled;
			} );

			it( 'should call onSuccess if meta includes response data', () => {
				dispatcher( store, success, next );

				expect( initiator ).to.not.have.beenCalled;
				expect( onSuccess ).to.have.been.calledWith( store, success, next, data );
				expect( onFailure ).to.not.have.beenCalled;
				expect( onProgress ).to.not.have.beenCalled;
			} );

			it( 'should call onFailure if meta includes error data', () => {
				dispatcher( store, failure, next );

				expect( initiator ).to.not.have.beenCalled;
				expect( onSuccess ).to.not.have.beenCalled;
				expect( onFailure ).to.have.been.calledWith( store, failure, next, error );
				expect( onProgress ).to.not.have.beenCalled;
			} );

			it( 'should call onFailure if meta includes both response data and error data', () => {
				dispatcher( store, both, next );

				expect( initiator ).to.not.have.beenCalled;
				expect( onSuccess ).to.not.have.beenCalled;
				expect( onFailure ).to.have.been.calledWith( store, both, next, error );
				expect( onProgress ).to.not.have.beenCalled;
			} );

			it( 'should call onProgress if meta includes progress data', () => {
				dispatcher( store, progress, next );

				expect( initiator ).to.not.have.beenCalled;
				expect( onSuccess ).to.not.have.beenCalled;
				expect( onFailure ).to.not.have.beenCalled;
				expect( onProgress ).to.have.been.calledWith( store, progress, next, progressInfo );
			} );

			it( 'should not throw runtime error if onProgress is not specified', () => {
				dispatcher = dispatchRequest( initiator, onSuccess, onFailure );
				expect( () => dispatcher( store, progress, next ) ).to.not.throw( TypeError );
			} );
		} );
	} );
} );
