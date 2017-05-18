/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { useFakeTimers } from 'test/helpers/use-sinon';
import {
	clearCounts,
	retryOnFailure,
} from '../';
import {
	noRetry,
	simpleRetry,
	exponentialBackoff,
} from '../policies';

const failer = { type: 'FAIL' };
const nextError = { fail: 'failed big time' };
const succeeder = { type: 'SUCCEED' };

const getSites = deepFreeze( {
	method: 'GET',
	path: '/sites',
	apiVersion: 'v1',
	onSuccess: succeeder,
	onFailure: failer,
} );

describe( '#retryOnFailure', () => {
	let clock;
	let dispatch;
	let store;

	useFakeTimers( fakeClock => clock = fakeClock );

	beforeEach( () => {
		clearCounts();

		dispatch = spy();
		store = { dispatch };
	} );

	it( 'should pass through initially successful requests', () => {
		const inbound = { nextRequest: getSites, store };

		expect( retryOnFailure( inbound ) ).to.equal( inbound );
		expect( dispatch ).to.have.not.been.called;
	} );

	it( 'should pass through no-retry failed requests', () => {
		const nextRequest = { ...getSites, options: { whenFailing: noRetry() } };
		const inbound = { nextError, nextRequest, store };

		expect( retryOnFailure( inbound ) ).to.equal( inbound );
		expect( dispatch ).to.have.not.been.called;
	} );

	it( 'should pass through POST requests', () => {
		const nextRequest = { ...getSites, method: 'POST', options: { whenFailing: simpleRetry( { delay: 1000 } ) } };
		const inbound = { nextError, nextRequest, store };

		expect( retryOnFailure( inbound ) ).to.equal( inbound );
		expect( dispatch ).to.have.not.been.called;
	} );

	it( 'should not mangle separate requests', () => {
		const nextRequest = { ...getSites, options: { whenFailing: exponentialBackoff( { delay: 1000 } ) } };
		const reqA = { nextError, nextRequest, store };

		expect( retryOnFailure( reqA ) ).to.have.property( 'shouldAbort', true );
		expect( retryOnFailure( reqA ) ).to.have.property( 'shouldAbort', true );
		expect( dispatch ).to.have.not.been.called;

		const reqB = { nextError, nextRequest: { ...nextRequest, path: '/sites/1' }, store };

		expect( retryOnFailure( reqB ) ).to.have.property( 'shouldAbort', true );
		expect( dispatch ).to.have.not.been.called;

		clock.tick( 2000 );

		expect( dispatch ).to.have.been.calledTwice;

		clock.tick( 8000 );

		expect( dispatch ).to.have.been.calledThrice;
	} );

	it( 'should retry with simple retries', () => {
		const nextRequest = { ...getSites, options: { whenFailing: simpleRetry( { delay: 1000 } ) } };
		const inbound = { nextError, nextRequest, originalRequest: getSites, store };

		expect( retryOnFailure( inbound ) ).to.have.property( 'shouldAbort', true );
		expect( dispatch ).to.have.not.been.called;

		clock.tick( 2000 );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( getSites );
	} );

	it( 'should retry only up to `maxTries` with simple retries', () => {
		const nextRequest = { ...getSites, options: { whenFailing: simpleRetry( { delay: 1000, maxTries: 1 } ) } };
		const inbound = { nextError, nextRequest, originalRequest: getSites, store };

		expect( retryOnFailure( inbound ) ).to.have.property( 'shouldAbort', true );
		expect( dispatch ).to.have.not.been.called;

		clock.tick( 2000 );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( getSites );

		expect( retryOnFailure( inbound ) ).to.have.property( 'shouldAbort', true );

		clock.tick( 2000 );

		expect( dispatch ).to.have.been.calledTwice;
		expect( dispatch ).to.have.been.calledWith( getSites );

		expect( retryOnFailure( inbound ) ).to.equal( inbound );

		clock.tick( 2000 );

		expect( dispatch ).to.have.been.calledTwice;
	} );

	it( 'should retry with exponential backoff', () => {
		const nextRequest = { ...getSites, options: { whenFailing: exponentialBackoff( { delay: 1000 } ) } };
		const inbound = { nextError, nextRequest, originalRequest: getSites, store };

		expect( retryOnFailure( inbound ) ).to.have.property( 'shouldAbort', true );
		expect( dispatch ).to.have.not.been.called;

		clock.tick( 6000 );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( getSites );
	} );

	it( 'should retry exponentially with exponential-backoff retries', () => {
		const nextRequest = { ...getSites, options: { whenFailing: exponentialBackoff( { delay: 1000, maxTries: 1 } ) } };
		const inbound = { nextError, nextRequest, originalRequest: getSites, store };

		expect( retryOnFailure( inbound ) ).to.have.property( 'shouldAbort', true );
		expect( dispatch ).to.have.not.been.called;

		clock.tick( 999 );
		expect( dispatch ).to.have.not.been.called;
		clock.tick( 3001 );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( getSites );

		expect( retryOnFailure( inbound ) ).to.have.property( 'shouldAbort', true );

		clock.tick( 1999 );
		expect( dispatch ).to.have.been.calledOnce;
		clock.tick( 6001 );

		expect( dispatch ).to.have.been.calledTwice;
		expect( dispatch ).to.have.been.calledWith( getSites );

		expect( retryOnFailure( inbound ) ).to.equal( inbound );

		clock.tick( 3999 );
		expect( dispatch ).to.have.been.calledTwice;
		clock.tick( 11001 );

		expect( dispatch ).to.have.been.calledTwice;
	} );

	it( 'should retry only up to `maxTries` with exponential-backoff retries', () => {
		const nextRequest = { ...getSites, options: { whenFailing: exponentialBackoff( { delay: 1000, maxTries: 1 } ) } };
		const inbound = { nextError, nextRequest, originalRequest: getSites, store };

		expect( retryOnFailure( inbound ) ).to.have.property( 'shouldAbort', true );
		expect( dispatch ).to.have.not.been.called;

		clock.tick( 6000 );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( getSites );

		expect( retryOnFailure( inbound ) ).to.have.property( 'shouldAbort', true );

		clock.tick( 12000 );

		expect( dispatch ).to.have.been.calledTwice;
		expect( dispatch ).to.have.been.calledWith( getSites );

		expect( retryOnFailure( inbound ) ).to.equal( inbound );

		clock.tick( 18000 );

		expect( dispatch ).to.have.been.calledTwice;
	} );
} );
