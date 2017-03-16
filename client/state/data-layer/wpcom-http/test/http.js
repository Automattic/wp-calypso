/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { WPCOM_HTTP_REQUEST } from 'state/action-types';

/**
 * Internal dependencies
 */
import {
	apiVersionPattern,
	apiNamespacePattern,
	http
} from '../actions';

describe( 'http', () => {
	describe( 'apiVersion shape', () => {
		it( 'should not accept `1` as a valid version', () => {
			expect( apiVersionPattern.test( '1' ) ).to.be.false;
		} );

		it( 'should accept `v1` as a valid version', () => {
			expect( apiVersionPattern.test( 'v1' ) ).to.be.true;
		} );

		it( 'should not accept `v1.` as a valid version', () => {
			expect( apiVersionPattern.test( 'v1.' ) ).to.be.false;
		} );

		it( 'should accept `v1.3` as a valid version', () => {
			expect( apiVersionPattern.test( 'v1.3' ) ).to.be.true;
		} );
	} );

	describe( 'apiNamespace shape', () => {
		it( 'should not accept `wpcom` as a valid namespace', () => {
			expect( apiNamespacePattern.test( 'wpcom' ) ).to.be.false;
		} );

		it( 'should accept `wpcom/v1` as a valid namespace', () => {
			expect( apiNamespacePattern.test( 'wpcom/v1' ) ).to.be.true;
		} );

		it( 'should not accept `wpcom/` as a valid namespace', () => {
			expect( apiNamespacePattern.test( 'wpcom/' ) ).to.be.false;
		} );

		it( 'should not accept `wpcom/1` as a valid namespace', () => {
			expect( apiNamespacePattern.test( 'wpcom/1' ) ).to.be.false;
		} );
	} );

	describe( 'request action', () => {
		it( 'should return a valid redux action defining apiVersion', () => {
			const action = http( {
				apiVersion: 'v2',
				method: 'GET',
				path: '/path/to/endpoint',
			} );

			expect( action ).to.eql( {
				type: WPCOM_HTTP_REQUEST,
				body: {},
				method: 'GET',
				path: '/path/to/endpoint',
				query: {
					apiVersion: 'v2'
				},
				options: {},
				onSuccess: null,
				onFailure: null,
				onProgress: null,
			} );
		} );

		it( 'should return a valid redux action defining apiNamespace', () => {
			const action = http( {
				apiNamespace: 'wpcom/v2',
				method: 'GET',
				path: '/path/to/endpoint',
			} );

			expect( action ).to.eql( {
				type: WPCOM_HTTP_REQUEST,
				body: {},
				method: 'GET',
				path: '/path/to/endpoint',
				query: {
					apiNamespace: 'wpcom/v2'
				},
				options: {},
				onSuccess: null,
				onFailure: null,
				onProgress: null,
			} );
		} );

		it( 'should return a valid redux action passing random parameters into the query', () => {
			const action = http( {
				apiVersion: 'v2',
				method: 'GET',
				path: '/path/to/endpoint',
				query: {
					number: 10,
					context: 'display',
					fields: [ 'foo', 'bar' ],
				}
			} );

			expect( action ).to.eql( {
				type: WPCOM_HTTP_REQUEST,
				body: {},
				method: 'GET',
				path: '/path/to/endpoint',
				query: {
					apiVersion: 'v2',
					number: 10,
					context: 'display',
					fields: [ 'foo', 'bar' ],
				},
				options: {},
				onSuccess: null,
				onFailure: null,
				onProgress: null,
			} );
		} );
	} );

	describe( 'bad request action', () => {
		it( 'should throw Error when `apiVersion` and `apiNamespace` are not defined.', () => {
			const boundRequest = http.bind( http, {
				path: '/path/to/endpoint',
				method: 'GET',
			} );

			expect( boundRequest ).to.throw( 'One of `apiNamespace` and `apiVersion` must be defined (see wpcom.js/README.md)' );
		} );

		it( 'should throw Error when `path` is not defined', () => {
			const boundRequest = http.bind( http, {
				apiVersion: 'v1',
				method: 'GET',
			} );

			expect( boundRequest ).to.throw( '{ path: undefined } param is invalid.' );
		} );

		it( 'should throw Error when `path` is invalid', () => {
			const boundRequest = http.bind( http, {
				apiVersion: 'v1',
				method: 'GET',
				path: true,
			} );

			expect( boundRequest ).to.throw( '{ path: true } param is invalid.' );
		} );

		it( 'should throw Error when method is not defined', () => {
			const boundRequest = http.bind( http, {
				apiVersion: 'v1',
				path: '/path/to/endpoint',
			} );

			expect( boundRequest ).to.throw( '{ method: undefined } param is invalid.' );
		} );

		it( 'should throw Error when method is unknown', () => {
			const boundRequest = http.bind( http, {
				apiVersion: 'v1',
				method: 'PUT',
				path: '/path/to/endpoint',
			} );

			expect( boundRequest ).to.throw( '{ method: PUT } param is invalid.' );
		} );

		it( 'should throw Error when apiVersion is invalid', () => {
			const boundRequest = http.bind( http, {
				apiVersion: 'version1',
				method: 'GET',
				path: '/path/to/endpoint',
			} );

			expect( boundRequest ).to.throw( 'Given \'apiVersion\' of \'version1\' doesn\'t match pattern: v1, v1.1, v2, etc…' );
		} );

		it( 'should throw Error when apiNamespace is invalid', () => {
			const boundRequest = http.bind( http, {
				apiNamespace: 'v1',
				method: 'GET',
				path: '/path/to/endpoint',

			} );

			expect( boundRequest ).to.throw( 'Given \'apiNamespace\' of \'v1\' doesn\'t match pattern: wp/v1, wp/v2, wpcom/v2, etc…' );
		} );

		it( 'should throw Error when both apiVersion and apiNamespace are simultaneously defined', () => {
			const boundRequest = http.bind( http, {
				apiVersion: 'v1',
				apiNamespace: 'wpcom/v2',
				method: 'GET',
				path: '/path/to/endpoint',
			} );

			expect( boundRequest ).to.throw( 'Cannot simultaneously define `apiNamespace` and `apiVersion` (see wpcom.js/README.md)' );
		} );
	} );
} );
