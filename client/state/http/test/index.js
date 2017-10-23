/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { httpHandler } from '../';
import superagentMock from './mocks/superagent';
import { failureMeta, successMeta } from 'state/data-layer/wpcom-http';
import { extendAction } from 'state/utils';
jest.mock( 'superagent', () => require( './mocks/superagent' ).handler );

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
	let dispatch;

	beforeEach( () => {
		dispatch = sinon.spy();
	} );

	test( 'should call `onSuccess` when a response returns with data', () => {
		const data = { value: 1 };

		superagentMock.setResponse( true, data );

		httpHandler( { dispatch }, getMe, null );

		expect( dispatch ).to.have.been.calledOnce;

		expect( dispatch ).to.have.been.calledWithMatch(
			sinon.match( extendAction( succeeder, successMeta( { body: data } ) ) )
		);
	} );

	test( 'should call `onFailure` when a response returns with error', () => {
		const data = { error: 'bad, bad request!' };
		superagentMock.setResponse( false, data );

		httpHandler( { dispatch }, getMe, null );

		expect( dispatch ).to.have.been.calledOnce;

		expect( dispatch ).to.have.been.calledWithMatch(
			sinon.match(
				extendAction( failer, failureMeta( { response: { body: { error: data.error } } } ) )
			)
		);
	} );

	test( 'should reject invalid headers', () => {
		const headers = [ { key: 'Accept', value: 'something' } ];
		httpHandler(
			{
				dispatch,
			},
			{
				...getMe,
				headers,
			},
			null
		);

		expect( dispatch ).to.have.been.calledWithMatch(
			sinon.match(
				extendAction(
					failer,
					failureMeta( new Error( "Not all headers were of an array pair: [ 'key', 'value' ]" ) )
				)
			)
		);
	} );

	test( 'should set appropriate headers', () => {
		const headers = [ [ 'Auth', 'something' ], [ 'Bearer', 'secret' ] ];

		superagentMock.setResponse( true, {} );

		httpHandler(
			{
				dispatch,
			},
			{
				...getMe,
				headers,
			},
			null
		);

		headers.forEach( ( [ key, value ] ) =>
			expect( superagentMock.getLastRequest().set ).to.have.been.calledWith( key, value )
		);
	} );

	test( 'should set appropriate query string', () => {
		const queryParams = [ [ 'statement', 'hello world' ], [ 'regex', '/.$/' ] ];

		const queryString = 'statement=hello%20world&regex=%2F.%24%2F';

		superagentMock.setResponse( true, {} );

		httpHandler(
			{
				dispatch,
			},
			{
				...getMe,
				queryParams,
			},
			null
		);

		expect( superagentMock.getLastRequest().query ).to.have.been.calledWith( queryString );
	} );

	test( 'should not set empty query string', () => {
		const queryParams = [];

		superagentMock.setResponse( true, {} );

		httpHandler(
			{
				dispatch,
			},
			{
				...getMe,
				queryParams,
			},
			null
		);

		expect( superagentMock.getLastRequest().query ).to.not.have.been.called;
	} );
} );
