import deepFreeze from 'deep-freeze';
import { merge } from 'lodash';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { useFakeTimers } from 'calypso/test-helpers/use-sinon';
import { retryOnFailure as rof } from '../';
import { noRetry, exponentialBackoff } from '../policies';

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

describe( '#retryOnFailure', () => {
	let clock;
	let dispatch;
	let store;

	useFakeTimers( ( fakeClock ) => ( clock = fakeClock ) );

	beforeEach( () => {
		dispatch = jest.fn();
		store = { dispatch };
	} );

	test( 'should pass through initially successful requests', () => {
		const inbound = { nextData: 1, originalRequest: getSites, store };

		expect( retryOnFailure( inbound ) ).toEqual( inbound );

		clock.tick( 20000 );
		expect( dispatch ).not.toBeCalled();
	} );

	test( 'should pass through no-retry failed requests', () => {
		const originalRequest = { ...getSites, options: { retryPolicy: noRetry() } };
		const inbound = { nextError, originalRequest, store };

		expect( retryOnFailure( inbound ) ).toEqual( inbound );

		clock.tick( 20000 );
		expect( dispatch ).not.toBeCalled();
	} );

	test( 'should pass through POST requests', () => {
		const originalRequest = { ...getSites, method: 'POST' };
		const inbound = { nextError, originalRequest, store };

		expect( retryOnFailure( inbound ) ).toEqual( inbound );

		clock.tick( 20000 );
		expect( dispatch ).not.toBeCalled();
	} );

	test( 'should requeue a plain failed request', () => {
		const inbound = { nextError, originalRequest: getSites, store };

		expect( retryWithDelay( 1337 )( inbound ) ).toHaveProperty( 'shouldAbort', true );
		expect( dispatch ).not.toBeCalled();

		clock.tick( 1337 );
		expect( dispatch ).toBeCalledWith( withRetries( 1 )( getSites ) );
	} );

	test( 'should requeue only up to `maxAttempts`', () => {
		const originalRequest = { ...getSites, options: { retryPolicy: { maxAttempts: 3 } } };
		const inbound = { nextError, originalRequest, store };
		const retryIt = retryWithDelay( 1337 );

		// retry 1
		expect( retryIt( inbound ) ).toHaveProperty( 'shouldAbort', true );
		expect( dispatch ).not.toBeCalled();

		clock.tick( 1337 );
		expect( dispatch ).toBeCalledWith( withRetries( 1 )( originalRequest ) );

		// retry 2
		expect(
			retryIt( { ...inbound, originalRequest: dispatch.mock.lastCall[ 0 ] } )
		).toHaveProperty( 'shouldAbort', true );
		expect( dispatch.mock.calls.length ).toEqual( 1 );

		clock.tick( 1337 );
		expect( dispatch.mock.calls.length ).toEqual( 2 );
		expect( dispatch ).toBeCalledWith( withRetries( 2 )( originalRequest ) );

		// retry 3
		expect(
			retryIt( { ...inbound, originalRequest: dispatch.mock.lastCall[ 0 ] } )
		).toHaveProperty( 'shouldAbort', true );
		expect( dispatch.mock.calls.length ).toEqual( 2 );

		clock.tick( 1337 );
		expect( dispatch.mock.calls.length ).toEqual( 3 );
		expect( dispatch ).toBeCalledWith( withRetries( 3 )( originalRequest ) );

		// retry 4
		const finalRequest = { ...inbound, originalRequest: dispatch.mock.lastCall[ 0 ] };
		expect( retryIt( finalRequest ) ).toEqual( finalRequest );
		expect( dispatch.mock.calls.length ).toEqual( 3 );

		clock.tick( 1337 );
		expect( dispatch.mock.calls.length ).toEqual( 3 );
	} );

	test( 'should handle `exponentialBackoff`', () => {
		const originalRequest = {
			...getSites,
			options: { retryPolicy: exponentialBackoff( { delay: 1000, maxAttempts: 5 } ) },
		};
		const inbound = { nextError, originalRequest, store };

		// retry 1
		expect( retryOnFailure( inbound ) ).toHaveProperty( 'shouldAbort', true );
		expect( dispatch ).not.toBeCalled();

		clock.tick( 1000 + 3 * 1000 );
		expect( dispatch ).toBeCalledTimes( 1 );

		clock.tick( 200000 );
		expect( dispatch ).toBeCalledTimes( 1 );

		// retry 4 (should have much longer delay)
		expect( retryOnFailure( withRetries( 4 )( inbound ) ) ).toHaveProperty( 'shouldAbort', true );
		expect( dispatch ).toBeCalledTimes( 1 );

		clock.tick( 1000 + 3 * 16000 );
		expect( dispatch ).toBeCalledTimes( 2 );

		clock.tick( 200000 );
		expect( dispatch ).toBeCalledTimes( 2 );

		// retry 5 (should not retry)
		expect( retryOnFailure( withRetries( 5 )( inbound ) ) ).toEqual( withRetries( 5 )( inbound ) );
		expect( dispatch ).toBeCalledTimes( 2 );

		clock.tick( 200000 );
		expect( dispatch ).toBeCalledTimes( 2 );
	} );
} );
