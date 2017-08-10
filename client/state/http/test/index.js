/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import { extendAction } from 'state/utils';
import { failureMeta, successMeta } from 'state/data-layer/wpcom-http';

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

class SuperAgentMock {
	constructor() {
		this._success = false;
		this._data = new Error( 'Mock response is not set' );
		this._lastRequest = null;
	}

	/***
	 * Mocks superagent() call that returns request
	 *
	 * const request = superagent( method, url );
	 *
	 * @param {String} method HTTP method
	 * @param {String} url URL
	 * @returns {Object} superagent like request with sinon spies
	 */
	handler = ( method, url ) => {
		const request = {
			method,
			url,
			withCredentials: sinon.spy(),
			set: sinon.spy(),
			query: sinon.spy(),
			accept: sinon.spy(),
			send: sinon.spy(),
			then: ( successHandler, failureHandler ) =>
				this._success
					? successHandler( { body: this._data } )
					: failureHandler( { response: { body: this._data } } ),
		};

		this._lastRequest = request;

		return request;
	};

	/***
	 * Tells the mock how to act, successful response or failure
	 *
	 * @param {Boolean} success should the request call success handler or failure?
	 * @param {Object} data the data that should be passed in body
	 */
	setResponse( success, data ) {
		this._success = success;
		this._data = data;
	}

	/***
	 * Get last mocked request
	 * @returns {Object} An object similar to superagent's request with additional `method` and `url` fields
	 */
	getLastRequest() {
		return this._lastRequest;
	}
}

const superagentMock = new SuperAgentMock();

describe( '#httpHandler', () => {
	let dispatch;
	let httpHandler;

	useMockery( mockery => mockery.registerMock( 'superagent', superagentMock.handler ) );

	before( () => {
		httpHandler = require( '../' ).httpHandler; // it's done here for mockery to work
	} );

	beforeEach( () => {
		dispatch = sinon.spy();
	} );

	it( 'should call `onSuccess` when a response returns with data', () => {
		const data = { value: 1 };

		superagentMock.setResponse( true, data );

		httpHandler( { dispatch }, getMe, null );

		expect( dispatch ).to.have.been.calledOnce;

		expect( dispatch ).to.have.been.calledWithMatch(
			sinon.match( extendAction( succeeder, successMeta( { body: data } ) ) )
		);
	} );

	it( 'should call `onFailure` when a response returns with error', () => {
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

	it( 'should reject invalid headers', () => {
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

	it( 'should set appropriate headers', () => {
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

	it( 'should set appropriate query string', () => {
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

	it( 'should not set empty query string', () => {
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
