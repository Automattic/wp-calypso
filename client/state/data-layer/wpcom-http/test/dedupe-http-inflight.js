/**
 * External dependencies
 */
import { assert, expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { } from '../utils.js';

import { WPCOM_HTTP_REQUEST } from 'state/action-types';
import { handleIngress, handleEgress, clearMap } from '../dedupe-http-inflight';

describe( 'WPCOM HTTP Data Layer', () => {
	describe( 'dedupe inflight requests', () => {
		const httpPostAction = {
			type: WPCOM_HTTP_REQUEST,
			method: 'POST',
			path: '/post',
		};

		const httpGet1 = {
			type: WPCOM_HTTP_REQUEST,
			method: 'GET',
			path: '1',
			onSuccess: { type: 'get1' },
			onError: { type: 'get1' },
		};
		const httpGet1DiffHandlers = {
			...httpGet1,
			onSuccess: { type: 'get1Diff' },
			onError: { type: 'get1Diff' },
		};
		const httpGet2 = { type: WPCOM_HTTP_REQUEST, method: 'GET', path: '2', };
		const httpGet3 = { type: WPCOM_HTTP_REQUEST, method: 'GET', path: '2?q=5', };

		describe( '#handleIngress', () => {
			const next = spy();
			const store = spy();

			beforeEach( () => {
				clearMap();
				next.reset();
			} );

			it( 'should allow through non-get requests', () => {
				handleIngress( store, next, httpPostAction );
				handleIngress( store, next, httpPostAction );
				handleIngress( store, next, httpPostAction );

				assert.equal( next.callCount, 3 );
				assert( next.calledWith( httpPostAction ) );
			} );

			it( 'should allow through unique requests', () => {
				handleIngress( store, next, httpGet1 );
				handleIngress( store, next, httpGet2 );
				handleIngress( store, next, httpGet3 );

				assert.equal( next.callCount, 3 );
				assert( next.calledWith( httpGet1 ) );
				assert( next.calledWith( httpGet2 ) );
				assert( next.calledWith( httpGet3 ) );
			} );

			it( 'should stop duped requests in their tracks!', () => {
				handleIngress( store, next, httpGet1 );
				handleIngress( store, next, httpGet1 );
				handleIngress( store, next, httpGet1DiffHandlers );

				assert.equal( next.callCount, 1 );
				assert( next.calledWith( httpGet1 ) );
			} );
		} );

		describe( 'handleEgress', () => {
			const next = spy();
			const store = spy();
			const onSuccessData = { meta: { dataLayer: { data: 'rooster' } } };
			const onErrorData = { meta: { dataLayer: { error: 'rooster' } } };
			const httpGet1EgressSuccess = { ...httpGet1, ...onSuccessData, };
			const httpGet1EgressFailure = { ...httpGet1, ...onErrorData, };

			beforeEach( () => {
				clearMap();
				next.reset();
			} );

			it( 'requests dropped because of duping should still have their onSuccess handler invoked', () => {
				handleIngress( store, next, httpGet1 );
				handleIngress( store, next, httpGet1DiffHandlers );
				handleEgress( store, next, httpGet1EgressSuccess );

				assert.equal( next.callCount, 3 );
				assert( next.calledWith( httpGet1 ) );
				expect( next ).to.be.calledWith( {
					type: httpGet1.onSuccess.type,
					...onSuccessData,
				} );
				expect( next ).to.be.calledWith( {
					type: httpGet1DiffHandlers.onSuccess.type,
					...onSuccessData,
				} );
			} );

			it( 'requests dropped because of duping should still have their onError handlers invoked', () => {
				handleIngress( store, next, httpGet1 );
				handleIngress( store, next, httpGet1DiffHandlers );
				handleEgress( store, next, httpGet1EgressFailure );

				assert.equal( next.callCount, 3 );
				assert( next.calledWith( httpGet1 ) );
				expect( next ).to.be.calledWith( {
					type: httpGet1.onError.type,
					...onErrorData,
				} );
				expect( next ).to.be.calledWith( {
					type: httpGet1DiffHandlers.onError.type,
					...onErrorData,
				} );
			} );
		} );
	} );
} );
