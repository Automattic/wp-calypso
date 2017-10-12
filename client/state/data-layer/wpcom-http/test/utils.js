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
	const withData = data => ( { type: 'SLUGGER', meta: { dataLayer: { data } } } );
	const withError = error => ( { type: 'SLUGGER', meta: { dataLayer: { error } } } );
	const withProgress = progress => ( {
		type: 'UPLOAD_PROGRESS',
		meta: { dataLayer: { progress } },
	} );

	describe( '#getData', () => {
		test( 'should return successful response data if available', () => {
			const data = { utterance: 'Bork bork' };

			expect( getData( withData( data ) ) ).to.equal( data );
		} );

		test( 'should return undefined if no response data available', () => {
			const action = { type: 'SLUGGER' };

			expect( getData( action ) ).to.be.undefined;
		} );
		test( 'should return valid-but-falsey data', () => {
			expect( getData( withData( '' ) ) ).to.equal( '' );
			expect( getData( withData( null ) ) ).to.equal( null );
			expect( getData( withData( 0 ) ) ).to.equal( 0 );
			expect( getData( withData( false ) ) ).to.equal( false );
		} );
	} );

	describe( '#getError', () => {
		test( 'should return failing error data if available', () => {
			const error = { utterance: 'Bork bork' };

			expect( getError( withError( error ) ) ).to.equal( error );
		} );

		test( 'should return undefined if no error data available', () => {
			const action = { type: 'SLUGGER' };

			expect( getError( action ) ).to.be.undefined;
		} );

		test( 'should return valid-but-falsey data', () => {
			expect( getError( withError( '' ) ) ).to.equal( '' );
			expect( getError( withError( null ) ) ).to.equal( null );
			expect( getError( withError( 0 ) ) ).to.equal( 0 );
			expect( getError( withError( false ) ) ).to.equal( false );
		} );
	} );

	describe( '#getProgress', () => {
		test( 'should return progress data if available', () => {
			const progress = { total: 1234, loaded: 123 };

			expect( getProgress( withProgress( progress ) ) ).to.equal( progress );
		} );
		test( 'should return valid-but-falsey data', () => {
			expect( getProgress( withProgress( '' ) ) ).to.equal( '' );
			expect( getProgress( withProgress( null ) ) ).to.equal( null );
			expect( getProgress( withProgress( 0 ) ) ).to.equal( 0 );
			expect( getProgress( withProgress( false ) ) ).to.equal( false );
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

		test( 'should call the initiator if meta information missing', () => {
			dispatcher( store, empty );

			expect( initiator ).to.have.been.calledWith( store, empty );
			expect( onSuccess ).to.not.have.been.called;
			expect( onFailure ).to.not.have.been.called;
			expect( onProgress ).to.not.have.been.called;
		} );

		test( 'should call onSuccess if meta includes response data', () => {
			dispatcher( store, success );

			expect( initiator ).to.not.have.been.called;
			expect( onSuccess ).to.have.been.calledWith( store, success, data );
			expect( onFailure ).to.not.have.been.called;
			expect( onProgress ).to.not.have.been.called;
		} );

		test( 'should call onFailure if meta includes error data', () => {
			dispatcher( store, failure );

			expect( initiator ).to.not.have.been.called;
			expect( onSuccess ).to.not.have.been.called;
			expect( onFailure ).to.have.been.calledWith( store, failure, error );
			expect( onProgress ).to.not.have.been.called;
		} );

		test( 'should call onFailure if meta includes both response data and error data', () => {
			dispatcher( store, both );

			expect( initiator ).to.not.have.been.called;
			expect( onSuccess ).to.not.have.been.called;
			expect( onFailure ).to.have.been.calledWith( store, both, error );
			expect( onProgress ).to.not.have.been.called;
		} );

		test( 'should call onProgress if meta includes progress data', () => {
			dispatcher( store, progress );

			expect( initiator ).to.not.have.been.called;
			expect( onSuccess ).to.not.have.been.called;
			expect( onFailure ).to.not.have.been.called;
			expect( onProgress ).to.have.been.calledWith( store, progress, progressInfo );
		} );

		test( 'should not throw runtime error if onProgress is not specified', () => {
			dispatcher = dispatchRequest( initiator, onSuccess, onFailure );
			expect( () => dispatcher( store, progress ) ).to.not.throw( TypeError );
		} );

		test( 'should validate response data', () => {
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

		test( 'should fail-over on invalid response data', () => {
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

		test( 'should validate with additional fields', () => {
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

		test( 'should filter out additional fields', () => {
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

		test( 'should transform validated output', () => {
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
