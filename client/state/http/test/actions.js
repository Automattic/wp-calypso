/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { http } from '../actions';

describe( '#rawHttp', () => {
	test( 'should set request parameters', () => {
		const url = 'http://yury.com';
		const method = 'POST';
		const headers = [ [ 'Content-Type', 'application/json' ] ];
		const queryParams = [ [ 'hello', 'world' ] ];
		const body = {
			hello: 'world',
		};
		const withCredentials = true;
		const onSuccess = { type: 'SUCCESS' };
		const onFailure = { type: 'FAIL' };

		const request = http( {
			url,
			method,
			headers,
			queryParams,
			body,
			withCredentials,
			onSuccess,
			onFailure,
		} );

		expect( request ).to.have.property( 'url', url );
		expect( request ).to.have.property( 'method', method );
		expect( request ).to.have.property( 'headers', headers );
		expect( request ).to.have.property( 'body', body );
		expect( request ).to.have.property( 'withCredentials', withCredentials );
		expect( request ).to.have.property( 'onSuccess', onSuccess );
		expect( request ).to.have.property( 'onFailure', onFailure );
	} );

	test( 'should set onSuccess and onFailure to whatever passed even when we have action', () => {
		const someFn = () => {};
		const someAction = { type: 'HELLO' };
		const request = http(
			{
				onSuccess: someFn,
				onFailure: someFn,
			},
			someAction
		);

		expect( request ).to.have.property( 'onSuccess', someFn );
		expect( request ).to.have.property( 'onFailure', someFn );
	} );

	test( 'should set onSuccess and onFailure to action if there is no handlers', () => {
		const someAction = { type: 'HELLO' };
		const request = http( {}, someAction );

		expect( request ).to.have.property( 'onSuccess', someAction );
		expect( request ).to.have.property( 'onFailure', someAction );
	} );
} );
