/**
 * External dependencies
 */
import nock from 'nock';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Chai, { expect } from 'chai';
import mockery from 'mockery';

mockery.enable( { warnOnUnregistered: false } );
var store = [];
mockery.registerMock( 'store', {
	get: ( key ) => store[ key ],
	set: ( key, val ) => {
		if( val === undefined ) delete store[ key ];
		store[ key ] = val;
	},
	remove: ( key ) => delete store[ key ],
	clear: () => store = [],
} );

const wpcom = require( 'lib/wp' );
const User = require( 'lib/user' );
const user = new User();
/**
 * Internal dependencies
 */
import {
	SUPPORT_USER_FETCH_TOKEN,
	SUPPORT_USER_ACTIVATED
} from 'state/action-types';

const { supportUserFetchToken } = require( '../actions' );

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
				} )
				.get( '/rest/v1.1/me' )
				.query( true )
				.reply( 200, {
						ID: 12345678,
						username: 'notarealuser'
				} )
				.get( '/rest/v1.1/sites/notarealsite.wordpress.com/posts' )
				.query( {
					support_user: 'notarealuser',
					_support_token: 'notarealtoken'
				} )
				.reply( 200, [] );
		} );

		beforeEach( () => {
			spy.reset();
			user.restoreUser();
		} );

		after( () => {
			nock.restore();
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			supportUserFetchToken( 'notarealuser', 'supportpassword' )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: SUPPORT_USER_FETCH_TOKEN,
				supportUser: 'notarealuser',
			} );
		} );

		it( 'should dispatch receive action when request completes', ( done ) => {
			supportUserFetchToken( 'notarealuser', 'supportpassword' )( spy )
				.then( () => {
					expect( spy ).to.have.been.calledWithMatch( {
							type: SUPPORT_USER_ACTIVATED,
							userData: {
								ID: 12345678,
								username: 'notarealuser'
							},
					} );
					done();
				} ).catch( done );
		} );

		it( 'should attach support user token to other requests', ( done ) => {
			const apiCall = () => {
				wpcom.req.get( { path: '/sites/notarealsite.wordpress.com/posts' } )
					.then( () => done() )
					.catch( done );
			}

			supportUserFetchToken( 'notarealuser', 'supportpassword' )( spy )
				.then( apiCall );
		} );
	} );
} );
