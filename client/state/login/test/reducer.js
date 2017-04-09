/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	LOGIN_REQUEST,
	LOGIN_REQUEST_FAILURE,
	LOGIN_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, {
	isRequesting,
	requestError,
	requestSuccess
} from '../reducer';

describe( 'reducer', () => {
	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'isRequesting',
			'magicLogin',
			'requestError',
			'requestSuccess',
		] );
	} );

	describe( 'isRequesting', () => {
		it( 'should default to a false', () => {
			const state = isRequesting( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should set isRequesting to true value if a request is initiated', () => {
			const state = isRequesting( undefined, {
				type: LOGIN_REQUEST,
			} );

			expect( state ).to.be.true;
		} );

		it( 'should set isRequesting to false value if a request was unsuccessful', () => {
			const state = isRequesting( undefined, {
				type: LOGIN_REQUEST_FAILURE,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should set isRequesting to false value if a request was successful', () => {
			const state = isRequesting( undefined, {
				type: LOGIN_REQUEST_SUCCESS,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should not persist state', () => {
			const state = isRequesting( true, {
				type: SERIALIZE
			} );

			expect( state ).to.be.false;
		} );

		it( 'should not load persisted state', () => {
			const state = isRequesting( true, {
				type: DESERIALIZE
			} );

			expect( state ).to.be.false;
		} );
	} );

	describe( 'requestError', () => {
		it( 'should default to a null', () => {
			const state = requestError( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should set requestError to null value if a request is initiated', () => {
			const state = requestError( 'some error', {
				type: LOGIN_REQUEST,
			} );

			expect( state ).to.be.null;
		} );

		it( 'should set requestError to null value if a request was successful', () => {
			const state = requestError( 'some error', {
				type: LOGIN_REQUEST_SUCCESS,
			} );

			expect( state ).to.be.null;
		} );

		it( 'should store the error in requestError if a request is unsuccessful', () => {
			const state = requestError( 'some error', {
				type: LOGIN_REQUEST_FAILURE,
				error: 'another error'
			} );

			expect( state ).to.eql( 'another error' );
		} );

		it( 'should not persist state', () => {
			const state = requestError( 'some error', {
				type: SERIALIZE
			} );

			expect( state ).to.be.null;
		} );

		it( 'should not load persisted state', () => {
			const state = requestError( 'some error', {
				type: DESERIALIZE
			} );

			expect( state ).to.be.null;
		} );
	} );

	describe( 'requestSuccess', () => {
		it( 'should default to a null', () => {
			const state = requestSuccess( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should set requestSuccess to null value if a request is initiated', () => {
			const state = requestSuccess( undefined, {
				type: LOGIN_REQUEST,
			} );

			expect( state ).to.be.null;
		} );

		it( 'should set requestSuccess to true value if a request was successful', () => {
			const state = requestSuccess( null, {
				type: LOGIN_REQUEST_SUCCESS,
			} );

			expect( state ).to.be.true;
		} );

		it( 'should set requestSuccess to false value if a request is unsuccessful', () => {
			const state = requestSuccess( null, {
				type: LOGIN_REQUEST_FAILURE,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should not persist state', () => {
			const state = requestSuccess( true, {
				type: SERIALIZE
			} );

			expect( state ).to.be.null;
		} );

		it( 'should not load persisted state', () => {
			const state = requestSuccess( true, {
				type: DESERIALIZE
			} );

			expect( state ).to.be.null;
		} );
	} );
} );
