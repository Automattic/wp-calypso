/**
 * External dependencies
 */
import { expect } from 'chai';
import nock from 'nock';

/**
 * Internal dependencies
 */
import {
	PUSH_NOTIFICATIONS_API_NOT_READY,
	PUSH_NOTIFICATIONS_RECEIVE_UNREGISTER_DEVICE,
	PUSH_NOTIFICATIONS_RECEIVE_REGISTER_DEVICE,
} from 'state/action-types';
import {
	apiNotReady,
	receiveUnregisterDevice,
	sendSubscriptionToWPCOM,
} from '../actions';

import { useSandbox } from 'test/helpers/use-sinon';

const API_DOMAIN = 'https://public-api.wordpress.com:443';

describe( 'actions', () => {
	let sandbox, spy;

	useSandbox( newSandbox => {
		sandbox = newSandbox;
		spy = sandbox.spy();
	} );

	beforeEach( () => {
		spy.reset();
	} );

	after( () => {
		nock.cleanAll();
	} );

	describe( 'receiveUnregisterDevice()', () => {
		it( 'should return an action object with empty data for empty input', () => {
			expect( receiveUnregisterDevice() ).to.eql( {
				type: PUSH_NOTIFICATIONS_RECEIVE_UNREGISTER_DEVICE,
				data: {},
			} );
		} );

		it( 'should return an action object with provided data intact', () => {
			const data = {
				devicestuff: 'some_value',
			};
			expect( receiveUnregisterDevice( data ) ).to.eql( {
				type: PUSH_NOTIFICATIONS_RECEIVE_UNREGISTER_DEVICE,
				data,
			} );
		} );
	} );

	describe( 'apiNotReady()', () => {
		it( 'should return an action object', () => {
			expect( apiNotReady() ).to.eql( {
				type: PUSH_NOTIFICATIONS_API_NOT_READY,
			} );
		} );
	} );

	// @TODO other "action object" tests like ^^

	describe( 'sendSubscriptionToWPCOM()', () => {
		const getState = () => ( { pushNotifications: { settings: {}, system: {} } } );

		describe( 'success', () => {
			before( () => {
				nock( API_DOMAIN )
					.persist()
					.post( `/rest/v1.1/devices/new` )
					.reply( 200, { ID: 123, settings: {} } );
			} );
			after( () => {
				nock.cleanAll();
			} );

			it( 'should dispatch receive action when request completes', () => {
				return sendSubscriptionToWPCOM( 'someTruthyValue' )( spy, getState ).then( () => {
					expect( spy ).to.have.been.calledWithMatch( {
						type: PUSH_NOTIFICATIONS_RECEIVE_REGISTER_DEVICE,
						data: {}
					} );
				} );
			} );
		} );
	} );
} );
