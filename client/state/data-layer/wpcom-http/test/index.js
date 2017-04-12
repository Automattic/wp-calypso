/**
 * External dependencies
 */
import { expect } from 'chai';
import { noop } from 'lodash';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import useNock, { nock } from 'test/helpers/use-nock';
import { extendAction } from 'state/utils';
import {
	failureMeta,
	fetcherMap,
	queueRequest,
	successMeta,
} from '../';

const processInbound = action => action;
const processOutbound = ( action, store, data, error ) => ( {
	failures: [ action.onFailure ],
	nextData: data,
	nextError: error,
	successes: [ action.onSuccess ],
} );

const http = queueRequest( processInbound, processOutbound );

const succeeder = { type: 'SUCCESS' };
const failer = { type: 'FAIL' };

const getMe = {
	method: 'GET',
	path: '/me',
	query: {
		apiVersion: '1.1',
	},
	onFailure: failer,
	onSuccess: succeeder,
};

describe( '#queueRequest', () => {
	const dispatch = spy();
	const next = spy();

	useNock();

	beforeEach( () => {
		dispatch.reset();
		next.reset();
	} );

	it( 'should call `onSuccess` when a response returns with data', done => {
		const data = { value: 1 };
		nock( 'https://public-api.wordpress.com:443' ).get( '/rest/v1.1/me' ).reply( 200, data );

		http( { dispatch }, getMe, next );

		expect( next ).to.have.been.calledWith( getMe );

		setTimeout( () => {
			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith( extendAction( succeeder, successMeta( data ) ) );
			done();
		}, 10 );
	} );

	it( 'should call `onFailure` when a response returns with an error', done => {
		const error = { error: 'bad' };
		nock( 'https://public-api.wordpress.com:443' ).get( '/rest/v1.1/me' ).replyWithError( error );

		http( { dispatch }, getMe, next );

		expect( next ).to.have.been.calledWith( getMe );

		setTimeout( () => {
			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith( extendAction( failer, failureMeta( error ) ) );
			done();
		}, 10 );
	} );
} );

describe( '#fetcherMap', () => {
	const wpcomReq = {
		get: spy(),
		post: spy(),
	};

	beforeEach( () => {
		wpcomReq.get.reset();
		wpcomReq.post.reset();
	} );

	describe( 'GET', () => {
		it( 'should send with query', () => {
			const getFooAction = {
				method: 'GET',
				path: '/foo',
				query: {
					apiNamespace: 'wp/v2',
				},
			};

			fetcherMap( 'GET', wpcomReq )( getFooAction, noop );

			expect( wpcomReq.get ).to.have.been.calledWith(
				{ path: '/foo' },
				{
					apiNamespace: 'wp/v2',
				},
				noop
			);
		} );
	} );

	describe( 'POST', () => {
		it( 'should send formData with query', () => {
			const postFooAction = {
				method: 'POST',
				path: '/foo',
				formData: [ [ 'foo', 'bar' ], ],
				query: { apiVersion: '1.1' },
			};

			fetcherMap( 'POST', wpcomReq )( postFooAction, noop );

			expect( wpcomReq.post ).to.have.been.calledWith(
				{
					path: '/foo',
					formData: [ [ 'foo', 'bar' ], ],
				},
				{
					apiVersion: '1.1',
				},
				null,
				noop
			);
		} );

		it( 'it should prioritize formData over body', () => {
			const postFooAction = {
				method: 'POST',
				path: '/foo',
				formData: [ [ 'foo', 'bar' ], ],
				body: { lorem: 'ipsum' },
			};

			fetcherMap( 'POST', wpcomReq )( postFooAction, noop );

			expect( wpcomReq.post ).to.have.been.calledWith(
				{
					path: '/foo',
					formData: [ [ 'foo', 'bar' ], ],
				},
				{ },
				null,
				noop
			);
		} );

		it( 'should send body in the absence of any formData', () => {
			const postFooAction = {
				method: 'POST',
				path: '/foo',
				body: { lorem: 'ipsum' },
			};

			fetcherMap( 'POST', wpcomReq )( postFooAction, noop );

			expect( wpcomReq.post ).to.have.been.calledWith(
				{ path: '/foo' },
				{ },
				{ lorem: 'ipsum' },
				noop
			);
		} );
	} );
} );
