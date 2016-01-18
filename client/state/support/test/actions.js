/**
 * External dependencies
 */
import nock from 'nock';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Chai, { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	SUPPORT_USER_TOKEN_FETCH,
	SUPPORT_USER_TOKEN_SET,
} from 'state/action-types';

const { supportUserTokenFetch } = require( '../actions' );

describe( 'actions', () => {
	describe( '#supportUserFetchToken()', () => {
		const spy = sinon.spy();

		before( () => {
			Chai.use( sinonChai );
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/internal/support/notarealuser/grant' )
				.reply( 200, {
					username: 'notarealuser',
					token: 'notarealtoken'
				} );
		} );

		beforeEach( () => {
			spy.reset();
		} );

		after( () => {
			nock.restore();
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			supportUserTokenFetch( 'notarealuser', 'supportpassword' )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: SUPPORT_USER_TOKEN_FETCH,
				supportUser: 'notarealuser',
			} );
		} );

		it( 'should dispatch receive action when request completes', ( done ) => {
			supportUserTokenFetch( 'notarealuser', 'supportpassword' )( spy )
				.then( () => {
					expect( spy ).to.have.been.calledWithMatch( {
						type: SUPPORT_USER_TOKEN_SET,
						supportUser: 'notarealuser',
						supportToken: 'notarealtoken'
					} );
					done();
				} ).catch( done );
		} );
	} );
} );
