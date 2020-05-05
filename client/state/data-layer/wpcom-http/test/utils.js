/**
 * Internal dependencies
 */
import {
	getData,
	getError,
	getProgress,
	dispatchRequest,
	reducer,
	trackRequests,
} from '../utils.js';

describe( 'WPCOM HTTP Data Layer', () => {
	const withData = ( data ) => ( { type: 'SLUGGER', meta: { dataLayer: { data } } } );
	const withError = ( error ) => ( { type: 'SLUGGER', meta: { dataLayer: { error } } } );
	const withProgress = ( progress ) => ( {
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
			expect( args ).toHaveLength( 1 );
			expect( args[ 0 ] ).toMatchObject( { meta: { dataLayer: {} } } );
		} );
	} );

	describe( '#dispatchRequest', () => {
		const fetch = () => ( { type: 'REQUEST' } );
		const onSuccess = ( action, data ) => ( { type: 'SUCCESS', data } );
		const onError = ( action, error ) => ( { type: 'FAILURE', error } );
		const onProgress = ( action, progress ) => ( { type: 'PROGRESS', progress } );

		const dispatcher = dispatchRequest( {
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
				dispatchRequest( { fetch, onSuccess, onError } )( store, progressHttpAction );
			} ).not.toThrow( TypeError );
		} );

		test( 'should pass data to fromApi for validation', () => {
			const fromApi = jest.fn( ( input ) => input );
			dispatchRequest( { fetch, onSuccess, onError, fromApi } )( store, successHttpAction );
			expect( fromApi ).toHaveBeenCalledWith( successHttpAction.meta.dataLayer.data );
			expect( dispatch ).toHaveBeenCalledWith( successAction );
		} );

		test( 'should fail-over on invalid response data', () => {
			const fromApi = () => {
				throw new Error( 'Test schema error' );
			};
			dispatchRequest( { fetch, onSuccess, onError, fromApi } )( store, successHttpAction );

			const args = dispatch.mock.calls[ 0 ];

			expect( args ).toHaveLength( 1 );
			expect( args[ 0 ] ).toMatchObject( { type: 'FAILURE' } );
		} );

		test( 'should return result of fromApi', () => {
			const fromApi = ( input ) => `Hello, ${ input }!`;
			const action = {
				type: 'REFILL',
				meta: { dataLayer: { data: 'world' } },
			};

			dispatchRequest( { fetch, onSuccess, onError, fromApi } )( store, action );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: 'SUCCESS',
				data: 'Hello, world!',
			} );
		} );
	} );
} );
