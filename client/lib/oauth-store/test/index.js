/**
 * External dependencies
 */
const Dispatcher = require( 'dispatcher' ),
	expect = require( 'chai' ).expect,
	sinon = require( 'sinon' );

/**
 * Internal dependencies
 */
import { actions, errors } from '../constants';
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
			required2faType: null,
			pushauth: null,
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
			required2faType: null,
			pushauth: null,
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
					error: errors.ERROR_REQUIRES_2FA,
					error_description: 'error'
				}
			}
		} );

		expect( oAuthStore.get() ).to.deep.equal( {
			inProgress: false,
			required2faType: 'code',
			pushauth: null,
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
					error: errors.ERROR_INVALID_OTP,
					error_description: 'error'
				}
			}
		} );

		expect( oAuthStore.get() ).to.deep.equal( {
			inProgress: false,
			required2faType: 'code',
			pushauth: null,
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
			required2faType: 'code',
			pushauth: null,
			errorMessage: false,
			errorLevel: false
		} );
	} ) );

	it( 'requires a push verification for a 2FA account that supports it', function() {
		Dispatcher.handleViewAction( { type: actions.AUTH_LOGIN } );
		Dispatcher.handleViewAction( {
			type: actions.RECEIVE_AUTH_LOGIN,
			error: true,
			data: {
				body: {
					error: errors.ERROR_REQUIRES_2FA_PUSH_VERIFICATION,
					error_description: 'error',
					error_info: {
						push_token: 'abcd',
						user_id: 1234
					}
				}
			}
		} );

		expect( oAuthStore.get() ).to.deep.equal( {
			inProgress: false,
			required2faType: 'push-verification',
			pushauth: {
				push_token: 'abcd',
				user_id: 1234
			},
			errorMessage: 'error',
			errorLevel: 'is-info'
		} );
	} );

	it( 'does not change state when the push token verification fails', function() {
		Dispatcher.handleViewAction( { type: actions.AUTH_LOGIN } );
		Dispatcher.handleViewAction( {
			type: actions.RECEIVE_AUTH_LOGIN,
			error: true,
			data: {
				body: {
					error: errors.ERROR_REQUIRES_2FA_PUSH_VERIFICATION,
					error_description: 'error',
					error_info: {
						push_token: 'abcd',
						user_id: 1234
					}
				}
			}
		} );
		Dispatcher.handleViewAction( {
			type: actions.RECEIVE_AUTH_LOGIN,
			error: true,
			data: {
				body: {
					error: errors.ERROR_INVALID_PUSH_TOKEN,
					error_description: 'error'
				}
			}
		} );

		expect( oAuthStore.get() ).to.deep.equal( {
			inProgress: false,
			required2faType: 'push-verification',
			pushauth: {
				push_token: 'abcd',
				user_id: 1234
			},
			errorMessage: 'error',
			errorLevel: 'is-info'
		} );
	} );

	it( 'changes 2fa type to use code', function() {
		Dispatcher.handleViewAction( { type: actions.AUTH_LOGIN } );
		Dispatcher.handleViewAction( {
			type: actions.RECEIVE_AUTH_LOGIN,
			error: true,
			data: {
				body: {
					error: errors.ERROR_REQUIRES_2FA_PUSH_VERIFICATION,
					error_description: 'error',
					error_info: {
						push_token: 'abcd',
						user_id: 1234
					}
				}
			}
		} );

		Dispatcher.handleViewAction( {
			type: actions.USE_AUTH_CODE,
			data: {
				message: 'Enter verification code'
			}
		} );

		expect( oAuthStore.get() ).to.deep.equal( {
			inProgress: false,
			required2faType: 'code',
			pushauth: null,
			errorMessage: 'Enter verification code',
			errorLevel: 'is-info'
		} );
	} );
} );
