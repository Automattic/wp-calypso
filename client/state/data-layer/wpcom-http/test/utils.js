/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { getData, getError, getProgress, dispatchRequest, makeParser } from '../utils.js';

describe( 'WPCOM HTTP Data Layer', () => {
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

		beforeEach( () => {
			initiator = spy();
			onSuccess = spy();
			onFailure = spy();
			onProgress = spy();
			dispatcher = dispatchRequest( initiator, onSuccess, onFailure, { onProgress } );
			store = spy();
		} );

		it( 'should call the initiator if meta information missing', () => {
			dispatcher( store, empty );

			expect( initiator ).to.have.been.calledWith( store, empty );
			expect( onSuccess ).to.not.have.been.called;
			expect( onFailure ).to.not.have.been.called;
			expect( onProgress ).to.not.have.been.called;
		} );

		it( 'should call onSuccess if meta includes response data', () => {
			dispatcher( store, success );

			expect( initiator ).to.not.have.been.called;
			expect( onSuccess ).to.have.been.calledWith( store, success, data );
			expect( onFailure ).to.not.have.been.called;
			expect( onProgress ).to.not.have.been.called;
		} );

		it( 'should call onFailure if meta includes error data', () => {
			dispatcher( store, failure );

			expect( initiator ).to.not.have.been.called;
			expect( onSuccess ).to.not.have.been.called;
			expect( onFailure ).to.have.been.calledWith( store, failure, error );
			expect( onProgress ).to.not.have.been.called;
		} );

		it( 'should call onFailure if meta includes both response data and error data', () => {
			dispatcher( store, both );

			expect( initiator ).to.not.have.been.called;
			expect( onSuccess ).to.not.have.been.called;
			expect( onFailure ).to.have.been.calledWith( store, both, error );
			expect( onProgress ).to.not.have.been.called;
		} );

		it( 'should call onProgress if meta includes progress data', () => {
			dispatcher( store, progress );

			expect( initiator ).to.not.have.been.called;
			expect( onSuccess ).to.not.have.been.called;
			expect( onFailure ).to.not.have.been.called;
			expect( onProgress ).to.have.been.calledWith( store, progress, progressInfo );
		} );

		it( 'should not throw runtime error if onProgress is not specified', () => {
			dispatcher = dispatchRequest( initiator, onSuccess, onFailure );
			expect( () => dispatcher( store, progress ) ).to.not.throw( TypeError );
		} );

		it( 'should validate response data', () => {
			const schema = {
				type: 'object',
				properties: { count: { type: 'integer' } },
			};

			const fromApi = makeParser( schema );
			dispatchRequest( initiator, onSuccess, onFailure, { fromApi } )( store, success, data );

			expect( initiator ).to.not.have.been.called;
			expect( onSuccess ).to.have.been.called;
			expect( onFailure ).to.not.have.been.called;
		} );

		it( 'should fail-over on invalid response data', () => {
			const schema = {
				type: 'object',
				properties: { count: { type: 'string' } },
			};

			const fromApi = makeParser( schema );
			dispatchRequest( initiator, onSuccess, onFailure, { fromApi } )( store, success, data );

			expect( initiator ).to.not.have.been.called;
			expect( onSuccess ).to.not.have.been.called;
			expect( onFailure ).to.have.been.called;
		} );

		it( 'should validate with additional fields', () => {
			const schema = {
				type: 'object',
				properties: { count: { type: 'integer' } },
			};

			const extra = { count: 15, is_active: true };
			const action = { type: 'REFILL', meta: { dataLayer: { data: extra } } };

			const fromApi = makeParser( schema );
			dispatchRequest( initiator, onSuccess, onFailure, { fromApi } )( store, action, extra );

			expect( initiator ).to.not.have.been.called;
			expect( onSuccess ).to.have.been.called;
			expect( onFailure ).to.not.have.been.called;
		} );

		it( 'should filter out additional fields', () => {
			const schema = {
				type: 'object',
				properties: { count: { type: 'integer' } },
			};

			const extra = { count: 15, is_active: true };
			const action = { type: 'REFILL', meta: { dataLayer: { data: extra } } };

			const fromApi = makeParser( schema );
			dispatchRequest( initiator, onSuccess, onFailure, { fromApi } )( store, action, extra );

			expect( initiator ).to.not.have.been.called;
			expect( onSuccess ).to.have.been.called;
			expect( onSuccess ).to.have.been.calledWithExactly( store, action, { count: 15 } );
			expect( onFailure ).to.not.have.been.called;
		} );

		it( 'should transform validated output', () => {
			const schema = {
				type: 'object',
				properties: { count: { type: 'integer' } },
			};

			const extra = { count: 15, is_active: true };
			const action = { type: 'REFILL', meta: { dataLayer: { data: extra } } };

			const transformer = ( { count } ) => ( { tribbleCount: count * 2, haveTrouble: true } );

			const fromApi = makeParser( schema, {}, transformer );
			dispatchRequest( initiator, onSuccess, onFailure, { fromApi } )( store, action, extra );

			expect( initiator ).to.not.have.been.called;
			expect( onSuccess ).to.have.been.called;
			expect( onSuccess ).to.have.been.calledWithExactly( store, action, {
				tribbleCount: 30,
				haveTrouble: true,
			} );
			expect( onFailure ).to.not.have.been.called;
		} );
	} );
} );
