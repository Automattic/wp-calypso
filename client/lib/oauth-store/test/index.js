/**
 * External dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	expect = require( 'chai' ).expect,
	sinon = require( 'sinon' );

/**
 * Internal dependencies
 */
import { actions } from '../constants';
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'oAuthStore', function() {
	let oAuthStore, oAuthToken;

	useFakeDom();

	beforeEach( function() {
		oAuthToken = require( 'lib/oauth-token' );
		oAuthStore = require( 'lib/oauth-store' );
	} );

	it( 'is in progress when attempting login', function() {
		Dispatcher.handleViewAction( { type: actions.AUTH_LOGIN } );

		expect( oAuthStore.get() ).to.deep.equal( {
			inProgress: true,
			requires2fa: false,
			errorMessage: false,
			errorLevel: false
		} );
	} );

	it( 'is no longer in progress when login fails', function() {
		Dispatcher.handleViewAction( { type: actions.AUTH_LOGIN } );
		Dispatcher.handleViewAction( {
			type: actions.RECEIVE_AUTH_LOGIN,
			error: { message: 'error' },
			data: false
		} );

		expect( oAuthStore.get() ).to.deep.equal( {
			inProgress: false,
			requires2fa: false,
			errorMessage: 'error',
			errorLevel: 'is-error'
		} );
	} );

	it( 'requires OTP for a 2FA account', function() {
		Dispatcher.handleViewAction( { type: actions.AUTH_LOGIN } );
		Dispatcher.handleViewAction( {
			type: actions.RECEIVE_AUTH_LOGIN,
			error: true,
			data: {
				body: {
					error: 'needs_2fa',
					error_description: 'error'
				}
			}
		} );

		expect( oAuthStore.get() ).to.deep.equal( {
			inProgress: false,
			requires2fa: true,
			errorMessage: 'error',
			errorLevel: 'is-info'
		} );
	} );

	it( 'requires OTP for a 2FA account when OTP is wrong', function() {
		Dispatcher.handleViewAction( { type: actions.AUTH_LOGIN } );
		Dispatcher.handleViewAction( {
			type: actions.RECEIVE_AUTH_LOGIN,
			error: true,
			data: {
				body: {
					error: 'invalid_otp',
					error_description: 'error'
				}
			}
		} );

		expect( oAuthStore.get() ).to.deep.equal( {
			inProgress: false,
			requires2fa: true,
			errorMessage: 'error',
			errorLevel: 'is-error'
		} );
	} );

	it( 'sets OAuth token when login is correct', sinon.test( function() {
		this.stub( global.document.location, 'replace' );
		this.stub( oAuthToken, 'setToken' );

		Dispatcher.handleViewAction( { type: actions.AUTH_LOGIN } );
		Dispatcher.handleViewAction( {
			type: actions.RECEIVE_AUTH_LOGIN,
			error: false,
			data: {
				body: {
					access_token: 'token'
				}
			}
		} );

		expect( oAuthToken.setToken ).to.have.been.calledOnce;
		expect( oAuthToken.setToken ).to.have.been.calledWith( 'token' );
		expect( global.document.location.replace ).to.have.been.calledOnce;
		expect( global.document.location.replace ).to.have.been.calledWith( '/' );

		expect( oAuthStore.get() ).to.deep.equal( {
			inProgress: true,
			requires2fa: true,
			errorMessage: false,
			errorLevel: false
		} );
	} ) );
} );
