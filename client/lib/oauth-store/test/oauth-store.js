/**
 * External dependencies
 */

var Dispatcher = require( 'dispatcher' ),
	expect = require( 'chai' ).expect,
	sinon = require( 'sinon' );

/**
 * Internal dependencies
 */
var oAuthToken = require( 'lib/oauth-token' ),
	testConstants = require( '../constants' );

describe( 'oAuthStore', function() {
	var oAuthStore

	beforeEach( function() {
		oAuthStore = require( 'lib/oauth-store' );
	} );

	it( 'is in progress when attempting login', function() {
		Dispatcher.handleViewAction( { type: testConstants.actions.AUTH_LOGIN } );

		expect( oAuthStore.get() ).to.deep.equal( {
			inProgress: true,
			requires2fa: false,
			errorMessage: false,
			errorLevel: false
		} );
	} );

	it( 'is no longer in progress when login fails', function() {
		Dispatcher.handleViewAction( { type: testConstants.actions.AUTH_LOGIN } );
		Dispatcher.handleViewAction( {
			type: testConstants.actions.RECEIVE_AUTH_LOGIN,
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
		Dispatcher.handleViewAction( { type: testConstants.actions.AUTH_LOGIN } );
		Dispatcher.handleViewAction( {
			type: testConstants.actions.RECEIVE_AUTH_LOGIN,
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
		Dispatcher.handleViewAction( { type: testConstants.actions.AUTH_LOGIN } );
		Dispatcher.handleViewAction( {
			type: testConstants.actions.RECEIVE_AUTH_LOGIN,
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

	it( 'sets OAuth token when login is correct', function() {
		var before = global.document;

		global.document = { location: { replace: sinon.stub() } };

		sinon.stub( oAuthToken, 'setToken' );

		Dispatcher.handleViewAction( { type: testConstants.actions.AUTH_LOGIN } );
		Dispatcher.handleViewAction( {
			type: testConstants.actions.RECEIVE_AUTH_LOGIN,
			error: false,
			data: {
				body: {
					access_token: 'token'
				}
			}
		} );

		expect( oAuthToken ).to.have.been.calledOnce;
		expect( oAuthToken.setToken.calledWith( 'token' ) ).to.be.true;
		expect( global.document.location.replace ).to.have.been.calledOnce;
		expect( global.document.location.replace.calledWith( '/' ) ).to.be.true;

		expect( oAuthStore.get() ).to.deep.equal( {
			inProgress: true,
			requires2fa: true,
			errorMessage: false,
			errorLevel: false
		} );

		oAuthToken.setToken.restore();

		global.document = before;
	} );
} );
