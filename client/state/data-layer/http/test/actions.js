/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { rawHttp } from '../actions';

describe( '#rawHttp', () => {
	it( 'should set request parameters', () => {
		const url = 'http://yury.com',
			method = 'POST',
			headers = [
				[ 'Content-Type', 'application/json' ]
			],
			body = {
				hello: 'world'
			},
			withCredentials = true,
			onSuccess = { type: 'SUCCESS' },
			onFailure = { type: 'FAIL' };

		const request = rawHttp( {
			url,
			method,
			headers,
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

	it( 'should set onSuccess and onFailure to whatever passed even we have action', () => {
		const someFn = () => {};
		const someAction = { type: 'HELLO' };
		const request = rawHttp( {
			onSuccess: someFn,
			onFailure: someFn,
		}, someAction );

		expect( request ).to.have.property( 'onSuccess', someFn );
		expect( request ).to.have.property( 'onFailure', someFn );
	} );

	it( 'should set onSuccess and onFailure to action if there is no handlers', () => {
		const someAction = { type: 'HELLO' };
		const request = rawHttp( {}, someAction );

		expect( request ).to.have.property( 'onSuccess', someAction );
		expect( request ).to.have.property( 'onFailure', someAction );
	} );
} );
