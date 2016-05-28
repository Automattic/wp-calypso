import { expect } from 'chai'
import Dispatcher from 'dispatcher'
import { default as Store, requestState } from '../index'
import { actions as ActionTypes } from '../constants'

const debug = require( 'debug' )( 'calypso:auth-code-request-store:test' ); //eslint-disable-line no-unused-vars

describe( 'index', () => {
	beforeEach( function() {
		Dispatcher.handleViewAction( { type: ActionTypes.AUTH_CODE_REQUEST_RESET } );
	} );

	it( 'is in initial state', () => {
		expect( Store.get() ).to.deep.equal( {
			status: requestState.READY,
			errorLevel: false,
			errorMessage: false
		} )
	} );

	it( 'is in progress when requesting code', () => {
		Dispatcher.handleViewAction( { type: ActionTypes.AUTH_CODE_REQUEST } );
		expect( Store.get() ).to.deep.equal( {
			status: requestState.REQUESTING,
			errorLevel: false,
			errorMessage: false
		} );
	} );

	it( 'is complete when server responds with needs_2fa', () => {
		Dispatcher.handleServerAction( {
			type: ActionTypes.RECEIVE_AUTH_CODE_REQUEST,
			data: { body: { error: 'needs_2fa' } },
			error: null
		} );

		expect( Store.get() ).to.deep.equal( {
			status: requestState.COMPLETE,
			errorLevel: false,
			errorMessage: false
		} );
	} );

	it( 'is an error when server responds without needs_2fa', () => {
		Dispatcher.handleServerAction( {
			type: ActionTypes.RECEIVE_AUTH_CODE_REQUEST,
			data: { body: { error: 'other', error_description: 'Failed' } },
			error: null
		} );

		expect( Store.get() ).to.deep.equal( {
			status: requestState.COMPLETE,
			errorLevel: 'is-error',
			errorMessage: 'Failed'
		} );
	} );

	it( 'is an error when server api request fails', () => {
		Dispatcher.handleServerAction( {
			type: ActionTypes.RECEIVE_AUTH_CODE_REQUEST,
			data: null,
			error: new Error( 'Failed' )
		} );

		expect( Store.get() ).to.deep.equal( {
			status: requestState.COMPLETE,
			errorLevel: 'is-error',
			errorMessage: 'Failed'
		} );
	} );
} );
