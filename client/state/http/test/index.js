/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
const fetch = require( 'jest-fetch-mock' );

/**
 * Internal dependencies
 */
import { encodeQueryParameters, httpHandler } from '../';
import { failureMeta, successMeta } from 'state/data-layer/wpcom-http';
import { extendAction } from 'state/utils';

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
	let completed;

	beforeAll( () => {
		global.fetch = fetch;
	} );

	beforeEach( () => {
		fetch.resetMocks();
		completed = new Promise( resolve => {
			dispatch = jest.fn( () => resolve( true ) );
		} );
	} );

	test( 'should call `onSuccess` when a response returns with data', async () => {
		const data = { value: 1 };
		fetch.mockResponse( JSON.stringify( data ) );

		httpHandler( { dispatch }, getMe, null );

		await completed;

		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith(
			extendAction( succeeder, successMeta( { body: data } ) )
		);
	} );

	test( 'should call `onFailure` when a response returns with error', async () => {
		const data = { error: 'bad, bad request!' };
		fetch.mockResponse( JSON.stringify( data ), { status: 500 } );

		httpHandler( { dispatch }, getMe, null );

		await completed;

		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith(
			extendAction( failer, failureMeta( { response: { body: { error: data.error } } } ) )
		);
	} );

	test( 'should call `onFailure` when a network error occurs', async () => {
		const errorMessage = 'Connection problems!';
		fetch.mockReject( new Error( errorMessage ) );

		httpHandler( { dispatch }, getMe, null );

		await completed;

		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith( {
			type: 'FAIL',
			meta: {
				dataLayer: {
					error: new Error( errorMessage ),
					headers: undefined,
				},
			},
		} );
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

		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith( {
			type: 'FAIL',
			meta: {
				dataLayer: {
					error: new Error( "Not all headers were of an array pair: [ 'key', 'value' ]" ),
					headers: undefined,
				},
			},
		} );
	} );

	test( 'should set appropriate headers', () => {
		const headers = [
			[ 'Auth', 'something' ],
			[ 'Bearer', 'secret' ],
		];
		const data = {};

		fetch.mockResponse( JSON.stringify( data ) );

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
			expect( fetch.mock.calls[ fetch.mock.calls.length - 1 ][ 1 ].headers ).toHaveProperty(
				key,
				value
			)
		);
	} );

	test( 'should set appropriate query string', () => {
		const queryParams = [
			[ 'statement', 'hello world' ],
			[ 'regex', '/.$/' ],
			[ 'spaced key', 'spaced value' ],
			[ 'plus+', 'plus+' ],
		];

		const queryString =
			'statement=hello%20world&regex=%2F.%24%2F&spaced%20key=spaced%20value&plus%2B=plus%2B';
		const data = {};

		fetch.mockResponse( JSON.stringify( data ) );

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

		expect( fetch.mock.calls[ fetch.mock.calls.length - 1 ][ 0 ] ).toContain( queryString );
	} );

	test( 'should not set empty query string', () => {
		const queryParams = [];
		const data = {};

		fetch.mockResponse( JSON.stringify( data ) );

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

		expect( fetch.mock.calls[ fetch.mock.calls.length - 1 ][ 0 ] ).not.toContain( '?' );
	} );
} );

describe( 'encodeQueryParameters()', () => {
	test( 'empty array to return empty string', () => {
		expect( encodeQueryParameters( [] ) ).toBe( '' );
	} );

	test( 'should cast undefined second pair to "undefined" in result', () => {
		expect( encodeQueryParameters( [ [ 'oat-milk' ] ] ) ).toBe( 'oat-milk=undefined' );
	} );

	test( 'should combine one string pair to equal left=right', () => {
		expect( encodeQueryParameters( [ [ 'large', '20oz' ] ] ) ).toBe( 'large=20oz' );
	} );

	test( 'should join string pairs with a &', () => {
		expect(
			encodeQueryParameters( [
				[ 'small', '12oz' ],
				[ 'medium', '16oz' ],
				[ 'large', '20oz' ],
			] )
		).toBe( 'small=12oz&medium=16oz&large=20oz' );
	} );

	test( 'should URI encode strings', () => {
		expect(
			encodeQueryParameters( [
				[ '@home', 'Rest & Relaxation' ],
				[ '@work', 'Focus & Determination' ],
				[ '@thebeach', 'Chillin՚ & Grillin՚' ],
			] )
		).toBe(
			'%40home=Rest%20%26%20Relaxation&%40work=Focus%20%26%20Determination&%40thebeach=Chillin%D5%9A%20%26%20Grillin%D5%9A'
		);
	} );

	test( 'should cast true and false to strings', () => {
		expect(
			encodeQueryParameters( [
				[ 'x', true ],
				[ 'y', false ],
			] )
		).toBe( 'x=true&y=false' );
	} );
} );
