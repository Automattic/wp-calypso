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
} from 'state/action-types';
import { loginUser } from '../actions';
import { useSandbox } from 'test/helpers/use-sinon';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	const username_or_email = 'wordpress';
	const password = '12345678';
	const successResponse = {
		code: 'success'
	};

	describe( '#loginUser()', () => {
		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/login/', {
						username_or_email,
						password
					} )
					.reply( 200, successResponse, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should return a login request action object when called', () => {
				loginUser( username_or_email, password )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: LOGIN_REQUEST,
					username_or_email,
					password,
				} );
			} );

			it( 'should return a login success action when request successfully completes', () => {
				return loginUser( username_or_email, password )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: LOGIN_REQUEST_SUCCESS,
						username_or_email,
						password,
						data: successResponse
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/login/', {
						username_or_email,
						password
					} )
					.reply( 401, {
						message: 'Invalid credentials'
					}, {
						'Content-Type': 'application/json'
					} );
			} );

			it( 'should return a login failure action when an error occurs', () => {
				return loginUser( username_or_email, password )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: LOGIN_REQUEST_FAILURE,
						username_or_email,
						password,
						error: 'Invalid credentials'
					} );
				} );
			} );
		} );
	} );
} );
