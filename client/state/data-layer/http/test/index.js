/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { HTTP_REQUEST } from 'state/action-types';
import useNock, { nock } from 'test/helpers/use-nock';
import { extendAction } from 'state/utils';
import { failureMeta, successMeta } from 'state/data-layer/wpcom-http';
import actionHandlers from '../';

const httpHandler = actionHandlers[ HTTP_REQUEST ][ 0 ];

const succeeder = { type: 'SUCCESS' };
const failer = { type: 'FAIL' };

const requestDomain = 'https://api.some-domain.com:443';
const requestPath = '/endpoint';
const getMe = {
	url: requestDomain + requestPath,
	method: 'GET',
	onFailure: failer,
	onSuccess: succeeder,
};

describe( '#rawHttpHandler', () => {
	let dispatch;
	let next;

	useNock();

	beforeEach( () => {
		dispatch = sinon.spy();
		next = sinon.spy();
	} );

	it( 'should call `onSuccess` when a response returns with data', () => {
		const data = { value: 1 };
		nock( requestDomain ).get( requestPath ).reply( 200, data );

		const requestPromise = httpHandler( { dispatch }, getMe, next );

		return requestPromise.then( () => {
			expect( dispatch ).to.have.been.calledOnce;

			sinon.assert.calledWith(
				dispatch,
				sinon.match(
					extendAction(
						succeeder,
						successMeta( { body: data } )
					)
				)
			);
		} );
	} );

	it( 'should call `onFailure` when a response returns with error', () => {
		const data = { error: 'bad, bad request!' };
		nock( requestDomain ).get( requestPath ).reply( 400, data );

		const requestPromise = httpHandler( { dispatch }, getMe, next );

		return requestPromise.catch( () => {
			expect( dispatch ).to.have.been.calledOnce;

			sinon.assert.calledWith(
				dispatch,
				sinon.match(
					extendAction(
						failer,
						failureMeta( { response: { body: { error: data.error } } } )
					)
				)
			);
		} );
	} );

	it( 'should reject invalid headers', () => {
		const headers = [ { key: 'Accept', value: 'something' } ];

		const requestPromise = httpHandler(
			{
				dispatch
			},
			{
				...getMe,
				headers
			},
			next
		);

		return requestPromise.catch( () => {
			sinon.assert.calledWith(
				dispatch,
				sinon.match(
					extendAction(
						failer,
						failureMeta( new Error( "Not all headers were of an array pair: [ 'key', 'value' ]" ) )
					)
				)
			);
		} );
	} );

	it( 'should set appropriate headers', () => {
		let requestedHeaders;
		nock( requestDomain ).get( requestPath )
			.reply( function replyHandler() { // don't use arrow func to allow `this` to be set:
				requestedHeaders = this.req.headers;

				return [
					200,
					'',
				];
			} );

		const headers = [
			[ 'Auth', 'something' ],
			[ 'Bearer', 'secret' ],
		];

		const requestPromise = httpHandler(
			{
				dispatch
			},
			{
				...getMe,
				headers
			},
			next
		);

		return requestPromise.then( () => {
			expect(
				headers
					.map( ( [ headerKey, headerValue ] ) => [ headerKey.toLowerCase(), headerValue ] )
					.every(
					( [ headerKey, headerValue ] ) => requestedHeaders[ headerKey ] === headerValue
				)
			).to.be.true;
		} );
	} );
} );
