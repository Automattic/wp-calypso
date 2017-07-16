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

describe( '#httpHandler', () => {
	let next;

	useNock();

	beforeEach( () => {
		next = sinon.spy();
	} );

	it( 'should call `onSuccess` when a response returns with data', done => {
		const data = { value: 1 };
		nock( requestDomain ).get( requestPath ).reply( 200, data );

		const dispatch = sinon.spy( () => {
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

			done();
		} );

		httpHandler( { dispatch }, getMe, next );
	} );

	it( 'should call `onFailure` when a response returns with error', done => {
		const data = { error: 'bad, bad request!' };
		nock( requestDomain ).get( requestPath ).reply( 400, data );

		const dispatch = sinon.spy( () => {
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

			done();
		} );

		httpHandler( { dispatch }, getMe, next );
	} );

	it( 'should reject invalid headers', done => {
		const dispatch = sinon.spy( () => {
			sinon.assert.calledWith(
				dispatch,
				sinon.match(
					extendAction(
						failer,
						failureMeta( new Error( "Not all headers were of an array pair: [ 'key', 'value' ]" ) )
					)
				)
			);

			done();
		} );

		const headers = [ { key: 'Accept', value: 'something' } ];
		httpHandler(
			{
				dispatch
			},
			{
				...getMe,
				headers
			},
			next
		);
	} );

	it( 'should set appropriate headers', done => {
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

		const dispatch = sinon.spy( () => {
			expect(
				headers
					.map( ( [ headerKey, headerValue ] ) => [ headerKey.toLowerCase(), headerValue ] )
					.every(
						( [ headerKey, headerValue ] ) => requestedHeaders[ headerKey ] === headerValue
					)
			).to.be.true;

			done();
		} );

		httpHandler(
			{
				dispatch
			},
			{
				...getMe,
				headers
			},
			next
		);
	} );
} );
