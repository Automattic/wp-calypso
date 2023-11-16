import deepFreeze from 'deep-freeze';
import { merge } from 'lodash';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { retryOnFailure as rof } from '../';
import { noRetry, exponentialBackoff } from '../policies';

jest.useFakeTimers();

const retryOnFailure = rof();
const retryWithDelay = ( delay ) => rof( () => delay );

const nextError = { fail: 'failed big time' };

const getSites = deepFreeze(
	http( {
		method: 'GET',
		path: '/sites',
		apiVersion: 'v1',
	} )
);

const withRetries = ( retryCount ) => ( actionOrInbound ) =>
	undefined !== actionOrInbound.originalRequest
		? merge( actionOrInbound, {
				originalRequest: withRetries( retryCount )( actionOrInbound.originalRequest ),
		  } )
		: merge( actionOrInbound, { meta: { dataLayer: { retryCount } } } );

const createMockStore = () => ( { dispatch: jest.fn() } );

describe( '#retryOnFailure', () => {
	test( 'should pass through initially successful requests', () => {
		const inbound = { nextData: 1, originalRequest: getSites, store: createMockStore() };

		expect( retryOnFailure( inbound ) ).toEqual( inbound );

		jest.advanceTimersByTime( 20000 );
		expect( inbound.store.dispatch ).not.toHaveBeenCalled();
	} );

	test( 'should pass through no-retry failed requests', () => {
		const originalRequest = { ...getSites, options: { retryPolicy: noRetry() } };
		const inbound = { nextError, originalRequest, store: createMockStore() };

		expect( retryOnFailure( inbound ) ).toEqual( inbound );

		jest.advanceTimersByTime( 20000 );
		expect( inbound.store.dispatch ).not.toHaveBeenCalled();
	} );

	test( 'should pass through POST requests', () => {
		const originalRequest = { ...getSites, method: 'POST' };
		const inbound = { nextError, originalRequest, store: createMockStore() };

		expect( retryOnFailure( inbound ) ).toEqual( inbound );

		jest.advanceTimersByTime( 20000 );
		expect( inbound.store.dispatch ).not.toHaveBeenCalled();
	} );

	test( 'should requeue a plain failed request', () => {
		const inbound = { nextError, originalRequest: getSites, store: createMockStore() };

		expect( retryWithDelay( 1337 )( inbound ) ).toHaveProperty( 'shouldAbort', true );
		expect( inbound.store.dispatch ).not.toHaveBeenCalled();

		jest.advanceTimersByTime( 1337 );
		expect( inbound.store.dispatch ).toHaveBeenCalledWith( withRetries( 1 )( getSites ) );
	} );

	test( 'should requeue only up to `maxAttempts`', () => {
		const originalRequest = { ...getSites, options: { retryPolicy: { maxAttempts: 3 } } };
		const inbound = { nextError, originalRequest, store: createMockStore() };
		const retryIt = retryWithDelay( 1337 );

		// retry 1
		expect( retryIt( inbound ) ).toHaveProperty( 'shouldAbort', true );
		expect( inbound.store.dispatch ).not.toHaveBeenCalled();

		jest.advanceTimersByTime( 1337 );
		expect( inbound.store.dispatch ).toHaveBeenCalledWith( withRetries( 1 )( originalRequest ) );

		// retry 2
		expect(
			retryIt( { ...inbound, originalRequest: inbound.store.dispatch.mock.lastCall[ 0 ] } )
		).toHaveProperty( 'shouldAbort', true );
		expect( inbound.store.dispatch ).toHaveBeenCalledTimes( 1 );

		jest.advanceTimersByTime( 1337 );
		expect( inbound.store.dispatch ).toHaveBeenCalledTimes( 2 );
		expect( inbound.store.dispatch ).toHaveBeenCalledWith( withRetries( 2 )( originalRequest ) );

		// retry 3
		expect(
			retryIt( { ...inbound, originalRequest: inbound.store.dispatch.mock.lastCall[ 0 ] } )
		).toHaveProperty( 'shouldAbort', true );
		expect( inbound.store.dispatch ).toHaveBeenCalledTimes( 2 );

		jest.advanceTimersByTime( 1337 );
		expect( inbound.store.dispatch ).toHaveBeenCalledTimes( 3 );
		expect( inbound.store.dispatch ).toHaveBeenCalledWith( withRetries( 3 )( originalRequest ) );

		// retry 4
		const finalRequest = { ...inbound, originalRequest: inbound.store.dispatch.mock.lastCall[ 0 ] };
		expect( retryIt( finalRequest ) ).toEqual( finalRequest );
		expect( inbound.store.dispatch ).toHaveBeenCalledTimes( 3 );

		jest.advanceTimersByTime( 1337 );
		expect( inbound.store.dispatch ).toHaveBeenCalledTimes( 3 );
	} );

	test( 'should handle `exponentialBackoff`', () => {
		const originalRequest = {
			...getSites,
			options: { retryPolicy: exponentialBackoff( { delay: 1000, maxAttempts: 5 } ) },
		};
		const inbound = { nextError, originalRequest, store: createMockStore() };

		// retry 1
		expect( retryOnFailure( inbound ) ).toHaveProperty( 'shouldAbort', true );
		expect( inbound.store.dispatch ).not.toHaveBeenCalled();

		jest.advanceTimersByTime( 1000 + 3 * 1000 );
		expect( inbound.store.dispatch ).toHaveBeenCalledTimes( 1 );

		jest.advanceTimersByTime( 200000 );
		expect( inbound.store.dispatch ).toHaveBeenCalledTimes( 1 );

		// retry 4 (should have much longer delay)
		expect( retryOnFailure( withRetries( 4 )( inbound ) ) ).toHaveProperty( 'shouldAbort', true );
		expect( inbound.store.dispatch ).toHaveBeenCalledTimes( 1 );

		jest.advanceTimersByTime( 1000 + 3 * 16000 );
		expect( inbound.store.dispatch ).toHaveBeenCalledTimes( 2 );

		jest.advanceTimersByTime( 200000 );
		expect( inbound.store.dispatch ).toHaveBeenCalledTimes( 2 );

		// retry 5 (should not retry)
		expect( retryOnFailure( withRetries( 5 )( inbound ) ) ).toEqual( withRetries( 5 )( inbound ) );
		expect( inbound.store.dispatch ).toHaveBeenCalledTimes( 2 );

		jest.advanceTimersByTime( 200000 );
		expect( inbound.store.dispatch ).toHaveBeenCalledTimes( 2 );
	} );
} );
