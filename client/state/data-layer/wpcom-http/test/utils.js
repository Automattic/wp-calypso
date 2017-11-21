/** @format */

/**
 * Internal dependencies
 */
import {
	getData,
	getError,
	getProgress,
	dispatchRequest,
	dispatchRequestEx,
	makeParser,
	reducer,
	trackRequests,
} from '../utils.js';

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

			expect( getData( withData( data ) ) ).toEqual( data );
		} );

		test( 'should return undefined if no response data available', () => {
			const action = { type: 'SLUGGER' };

			expect( getData( action ) ).toBeUndefined();
		} );
		test( 'should return valid-but-falsey data', () => {
			expect( getData( withData( '' ) ) ).toBe( '' );
			expect( getData( withData( null ) ) ).toBe( null );
			expect( getData( withData( 0 ) ) ).toBe( 0 );
			expect( getData( withData( false ) ) ).toBe( false );
		} );
	} );

	describe( '#getError', () => {
		test( 'should return failing error data if available', () => {
			const error = { utterance: 'Bork bork' };

			expect( getError( withError( error ) ) ).toEqual( error );
		} );

		test( 'should return undefined if no error data available', () => {
			const action = { type: 'SLUGGER' };

			expect( getError( action ) ).toBeUndefined();
		} );

		test( 'should return valid-but-falsey data', () => {
			expect( getError( withError( '' ) ) ).toBe( '' );
			expect( getError( withError( null ) ) ).toBe( null );
			expect( getError( withError( 0 ) ) ).toBe( 0 );
			expect( getError( withError( false ) ) ).toBe( false );
		} );
	} );

	describe( '#getProgress', () => {
		test( 'should return progress data if available', () => {
			const progress = { total: 1234, loaded: 123 };

			expect( getProgress( withProgress( progress ) ) ).toEqual( progress );
		} );
		test( 'should return valid-but-falsey data', () => {
			expect( getProgress( withProgress( '' ) ) ).toBe( '' );
			expect( getProgress( withProgress( null ) ) ).toBe( null );
			expect( getProgress( withProgress( 0 ) ) ).toBe( 0 );
			expect( getProgress( withProgress( false ) ) ).toBe( false );
		} );
	} );

	describe( '#reducer', () => {
		test( 'should update based on presence of request meta key', () =>
			expect(
				reducer( {}, { meta: { dataLayer: { status: 'pending', requestKey: 'cats' } } } )
			).toMatchObject( {
				cats: { status: 'pending' },
			} ) );

		test( 'should only update requested meta key', () => {
			const prev = { cats: { status: 'pending' } };
			const action = { meta: { dataLayer: { status: 'failure', requestKey: 'dogs' } } };

			expect( reducer( prev, action ) ).toMatchObject( {
				cats: { status: 'pending' },
				dogs: { status: 'failure' },
			} );
		} );

		test( 'should not update just because an action has meta', () =>
			expect( reducer( {}, { meta: { value: 1337 } } ) ).toEqual( {} ) );

		test( 'should track previous request when updating', () => {
			const prev = { dogs: { status: 'success', lastUpdated: 1000 } };
			const action = {
				meta: { dataLayer: { requestKey: 'dogs', status: 'pending', pendingSince: 1500 } },
			};

			const next = reducer( prev, action );

			expect( next ).toMatchObject( { dogs: { lastUpdated: 1000 } } );
		} );

		test( 'should not care if pending flag is persisted', () => {} );
	} );

	describe( '#trackRequests', () => {
		test( 'should bypass actions without opt-in flag', () => {
			const store = {};
			const action = {};
			const next = jest.fn();

			trackRequests( next )( store, action );

			expect( next ).toHaveBeenCalledWith( store, action );
		} );

		test( 'should bypass progress events', () => {
			const store = {};
			const action = { meta: { dataLayer: { trackRequest: true, progress: {} } } };
			const next = jest.fn();

			trackRequests( next )( store, action );

			expect( next ).toHaveBeenCalledWith( store, action );
		} );

		test( 'should inject false dispatcher', () => {
			const store = { dispatch: jest.fn() };
			const action = { meta: { dataLayer: { trackRequest: true } } };
			const next = jest.fn();

			trackRequests( next )( store, action );

			const { dispatch } = next.mock.calls[ 0 ][ 0 ];

			dispatch( {} );

			const args = store.dispatch.mock.calls[ 0 ];
			expect( args.length ).toBe( 1 );
			expect( args[ 0 ] ).toMatchObject( { meta: { dataLayer: {} } } );
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
			initiator = jest.fn();
			onSuccess = jest.fn();
			onFailure = jest.fn();
			onProgress = jest.fn();
			dispatcher = dispatchRequest( initiator, onSuccess, onFailure, { onProgress } );
			store = jest.fn();
		} );

		test( 'should call the initiator if meta information missing', () => {
			dispatcher( store, empty );

			expect( initiator ).toHaveBeenCalledWith( store, empty );
			expect( onSuccess ).not.toHaveBeenCalled();
			expect( onFailure ).not.toHaveBeenCalled();
			expect( onProgress ).not.toHaveBeenCalled();
		} );

		test( 'should call onSuccess if meta includes response data', () => {
			dispatcher( store, success );

			expect( initiator ).not.toHaveBeenCalled();
			expect( onSuccess ).toHaveBeenCalledWith( store, success, data );
			expect( onFailure ).not.toHaveBeenCalled();
			expect( onProgress ).not.toHaveBeenCalled();
		} );

		test( 'should call onFailure if meta includes error data', () => {
			dispatcher( store, failure );

			expect( initiator ).not.toHaveBeenCalled();
			expect( onSuccess ).not.toHaveBeenCalled();
			expect( onFailure ).toHaveBeenCalledWith( store, failure, error );
			expect( onProgress ).not.toHaveBeenCalled();
		} );

		test( 'should call onFailure if meta includes both response data and error data', () => {
			dispatcher( store, both );

			expect( initiator ).not.toHaveBeenCalled();
			expect( onSuccess ).not.toHaveBeenCalled();
			expect( onFailure ).toHaveBeenCalledWith( store, both, error );
			expect( onProgress ).not.toHaveBeenCalled();
		} );

		test( 'should call onProgress if meta includes progress data', () => {
			dispatcher( store, progress );

			expect( initiator ).not.toHaveBeenCalled();
			expect( onSuccess ).not.toHaveBeenCalled();
			expect( onFailure ).not.toHaveBeenCalled();
			expect( onProgress ).toHaveBeenCalledWith( store, progress, progressInfo );
		} );

		test( 'should not throw runtime error if onProgress is not specified', () => {
			dispatcher = dispatchRequest( initiator, onSuccess, onFailure );
			expect( () => dispatcher( store, progress ) ).not.toThrow( TypeError );
		} );

		test( 'should validate response data', () => {
			const schema = {
				type: 'object',
				properties: { count: { type: 'integer' } },
			};

			const fromApi = makeParser( schema );
			dispatchRequest( initiator, onSuccess, onFailure, { fromApi } )( store, success, data );

			expect( initiator ).not.toHaveBeenCalled();
			expect( onSuccess ).toHaveBeenCalled();
			expect( onFailure ).not.toHaveBeenCalled();
		} );

		test( 'should fail-over on invalid response data', () => {
			const schema = {
				type: 'object',
				properties: { count: { type: 'string' } },
			};

			const fromApi = makeParser( schema );
			dispatchRequest( initiator, onSuccess, onFailure, { fromApi } )( store, success, data );

			expect( initiator ).not.toHaveBeenCalled();
			expect( onSuccess ).not.toHaveBeenCalled();
			expect( onFailure ).toHaveBeenCalled();
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

			expect( initiator ).not.toHaveBeenCalled();
			expect( onSuccess ).toHaveBeenCalled();
			expect( onFailure ).not.toHaveBeenCalled();
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

			expect( initiator ).not.toHaveBeenCalled();
			expect( onSuccess ).toHaveBeenCalled();
			expect( onSuccess ).toHaveBeenCalledWith( store, action, { count: 15 } );
			expect( onFailure ).not.toHaveBeenCalled();
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

			expect( initiator ).not.toHaveBeenCalled();
			expect( onSuccess ).toHaveBeenCalledWith( store, action, {
				tribbleCount: 30,
				haveTrouble: true,
			} );
			expect( onFailure ).not.toHaveBeenCalled();
		} );
	} );

	describe( '#dispatchRequestEx', () => {
		const fetch = () => ( { type: 'REQUEST' } );
		const onSuccess = ( action, data ) => ( { type: 'SUCCESS', data } );
		const onError = ( action, error ) => ( { type: 'FAILURE', error } );
		const onProgress = ( action, progress ) => ( { type: 'PROGRESS', progress } );

		const dispatcher = dispatchRequestEx( {
			fetch,
			onSuccess,
			onError,
			onProgress,
		} );

		const data = { count: 5 };
		const error = { message: 'oh no!' };
		const progress = { loaded: 45, total: 80 };

		const fetchHttpAction = { type: 'REFILL' };
		const successHttpAction = { type: 'REFILL', meta: { dataLayer: { data } } };
		const failureHttpAction = { type: 'REFILL', meta: { dataLayer: { error } } };
		const progressHttpAction = { type: 'REFILL', meta: { dataLayer: { progress } } };
		const bothHttpAction = { type: 'REFILL', meta: { dataLayer: { data, error } } };

		const fetchAction = { type: 'REQUEST' };
		const successAction = { type: 'SUCCESS', data };
		const failureAction = { type: 'FAILURE', error };
		const progressAction = { type: 'PROGRESS', progress };

		let dispatch;
		let store;

		beforeEach( () => {
			dispatch = jest.fn();
			store = { dispatch };
		} );

		test( 'should initiate request if meta information missing', () => {
			dispatcher( store, fetchHttpAction );
			expect( dispatch ).toHaveBeenCalledWith( fetchAction );
		} );

		test( 'should call onSuccess if meta includes response data', () => {
			dispatcher( store, successHttpAction );
			expect( dispatch ).toHaveBeenCalledWith( successAction );
		} );

		test( 'should call onError if meta includes error data', () => {
			dispatcher( store, failureHttpAction );
			expect( dispatch ).toHaveBeenCalledWith( failureAction );
		} );

		test( 'should call onError if meta includes both response data and error data', () => {
			dispatcher( store, bothHttpAction );
			expect( dispatch ).toHaveBeenCalledWith( failureAction );
		} );

		test( 'should call onProgress if meta includes progress data', () => {
			dispatcher( store, progressHttpAction );
			expect( dispatch ).toHaveBeenCalledWith( progressAction );
		} );

		test( 'should not throw runtime error if onProgress is not specified', () => {
			expect( () => {
				dispatchRequestEx( { fetch, onSuccess, onError } )( store, progressHttpAction );
			} ).not.toThrow( TypeError );
		} );

		test( 'should validate response data', () => {
			const fromApi = makeParser( {
				type: 'object',
				properties: { count: { type: 'integer' } },
			} );
			dispatchRequestEx( { fetch, onSuccess, onError, fromApi } )( store, successHttpAction );
			expect( dispatch ).toHaveBeenCalledWith( successAction );
		} );

		test( 'should fail-over on invalid response data', () => {
			const fromApi = makeParser( {
				type: 'object',
				properties: { count: { type: 'string' } },
			} );
			dispatchRequestEx( { fetch, onSuccess, onError, fromApi } )( store, successHttpAction );

			const args = dispatch.mock.calls[ 0 ];

			expect( args.length ).toBe( 1 );
			expect( args[ 0 ] ).toMatchObject( { type: 'FAILURE' } );
		} );

		test( 'should validate with additional fields', () => {
			const fromApi = makeParser( {
				type: 'object',
				properties: { count: { type: 'integer' } },
			} );

			const action = {
				type: 'REFILL',
				meta: { dataLayer: { data: { count: 15, is_active: true } } },
			};

			dispatchRequestEx( { fetch, onSuccess, onError, fromApi } )( store, action );

			const args = dispatch.mock.calls[ 0 ];

			expect( args.length ).toBe( 1 );
			expect( args[ 0 ] ).toMatchObject( { type: 'SUCCESS' } );
		} );

		test( 'should filter out additional fields', () => {
			const fromApi = makeParser( {
				type: 'object',
				properties: { count: { type: 'integer' } },
			} );

			const action = {
				type: 'REFILL',
				meta: { dataLayer: { data: { count: 15, is_active: true } } },
			};

			dispatchRequestEx( { fetch, onSuccess, onError, fromApi } )( store, action );
			expect( dispatch ).toHaveBeenCalledWith( { type: 'SUCCESS', data: { count: 15 } } );
		} );

		test( 'should transform validated output', () => {
			const schema = {
				type: 'object',
				properties: { count: { type: 'integer' } },
			};
			const transformer = ( { count } ) => ( { tribbleCount: count * 2, haveTrouble: true } );
			const fromApi = makeParser( schema, {}, transformer );

			const action = {
				type: 'REFILL',
				meta: { dataLayer: { data: { count: 15, is_active: true } } },
			};

			dispatchRequestEx( { fetch, onSuccess, onError, fromApi } )( store, action );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: 'SUCCESS',
				data: {
					tribbleCount: 30,
					haveTrouble: true,
				},
			} );
		} );
	} );
} );
