/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { actions } from '../constants';

/**
 * External dependencies
 */
import Dispatcher from 'calypso/dispatcher';
import { expect } from 'chai';
import sinon from 'sinon';

describe( 'oAuthStore', () => {
	let oAuthStore, oAuthToken, originalDocumentProperties;

	beforeEach( () => {
		oAuthToken = require( 'calypso/lib/oauth-token' );
		oAuthStore = require( 'calypso/lib/oauth-store' );

		// global.document.location is not configurable and global.document has an empty setter
		// so the only way to mock global.document.location.replace is do a full replacement
		// of global.document using a property descriptor
		originalDocumentProperties = Object.getOwnPropertyDescriptors( global ).document;
		Object.defineProperty( global, 'document', {
			writable: true,
			value: {
				location: {
					replace: sinon.stub(),
				},
			},
		} );
	} );

	afterEach( () => {
		Object.defineProperty( global, 'document', originalDocumentProperties );
	} );

	test( 'is in progress when attempting login', () => {
		Dispatcher.handleViewAction( { type: actions.AUTH_LOGIN } );

		expect( oAuthStore.get() ).to.deep.equal( {
			inProgress: true,
			requires2fa: false,
			errorMessage: false,
			errorLevel: false,
		} );
	} );

	test( 'is no longer in progress when login fails', () => {
		Dispatcher.handleViewAction( { type: actions.AUTH_LOGIN } );
		Dispatcher.handleViewAction( {
			type: actions.RECEIVE_AUTH_LOGIN,
			error: { message: 'error' },
			data: false,
		} );

		expect( oAuthStore.get() ).to.deep.equal( {
			inProgress: false,
			requires2fa: false,
			errorMessage: 'error',
			errorLevel: 'is-error',
		} );
	} );

	test( 'requires OTP for a 2FA account', () => {
		Dispatcher.handleViewAction( { type: actions.AUTH_LOGIN } );
		Dispatcher.handleViewAction( {
			type: actions.RECEIVE_AUTH_LOGIN,
			error: true,
			data: {
				body: {
					error: 'needs_2fa',
					error_description: 'error',
				},
			},
		} );

		expect( oAuthStore.get() ).to.deep.equal( {
			inProgress: false,
			requires2fa: true,
			errorMessage: 'error',
			errorLevel: 'is-info',
		} );
	} );

	test( 'requires OTP for a 2FA account when OTP is wrong', () => {
		Dispatcher.handleViewAction( { type: actions.AUTH_LOGIN } );
		Dispatcher.handleViewAction( {
			type: actions.RECEIVE_AUTH_LOGIN,
			error: true,
			data: {
				body: {
					error: 'invalid_otp',
					error_description: 'error',
				},
			},
		} );

		expect( oAuthStore.get() ).to.deep.equal( {
			inProgress: false,
			requires2fa: true,
			errorMessage: 'error',
			errorLevel: 'is-error',
		} );
	} );

	test( 'sets OAuth token when login is correct', () => {
		sinon.stub( oAuthToken, 'setToken' );

		Dispatcher.handleViewAction( { type: actions.AUTH_LOGIN } );
		Dispatcher.handleViewAction( {
			type: actions.RECEIVE_AUTH_LOGIN,
			error: false,
			data: {
				body: {
					access_token: 'token',
				},
			},
		} );

		expect( oAuthToken.setToken ).to.have.been.calledOnce;
		expect( oAuthToken.setToken ).to.have.been.calledWith( 'token' );
		expect( global.document.location.replace ).to.have.been.calledOnce;
		expect( global.document.location.replace ).to.have.been.calledWith( '/' );

		expect( oAuthStore.get() ).to.deep.equal( {
			inProgress: true,
			requires2fa: true,
			errorMessage: false,
			errorLevel: false,
		} );

		oAuthToken.setToken.restore();
	} );
} );
