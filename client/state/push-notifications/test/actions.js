/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { apiNotReady, receiveUnregisterDevice, sendSubscriptionToWPCOM } from '../actions';
import {
	PUSH_NOTIFICATIONS_API_NOT_READY,
	PUSH_NOTIFICATIONS_RECEIVE_UNREGISTER_DEVICE,
	PUSH_NOTIFICATIONS_RECEIVE_REGISTER_DEVICE,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

const API_DOMAIN = 'https://public-api.wordpress.com:443';

describe( 'actions', () => {
	let sandbox, spy;

	useSandbox( ( newSandbox ) => {
		sandbox = newSandbox;
		spy = sandbox.spy();
	} );

	beforeEach( () => {
		spy.resetHistory();
	} );

	describe( 'receiveUnregisterDevice()', () => {
		test( 'should return an action object with empty data for empty input', () => {
			expect( receiveUnregisterDevice() ).to.eql( {
				type: PUSH_NOTIFICATIONS_RECEIVE_UNREGISTER_DEVICE,
				data: {},
			} );
		} );

		test( 'should return an action object with provided data intact', () => {
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
		test( 'should return an action object', () => {
			expect( apiNotReady() ).to.eql( {
				type: PUSH_NOTIFICATIONS_API_NOT_READY,
			} );
		} );
	} );

	// @TODO other "action object" tests like ^^

	describe( 'sendSubscriptionToWPCOM()', () => {
		const getState = () => ( { pushNotifications: { settings: {}, system: {} } } );

		describe( 'success', () => {
			useNock( ( nock ) => {
				nock( API_DOMAIN )
					.persist()
					.post( '/rest/v1.1/devices/new' )
					.reply( 200, { ID: 123, settings: {} } );
			} );

			test( 'should dispatch receive action when request completes', () => {
				return sendSubscriptionToWPCOM( 'someTruthyValue' )( spy, getState ).then( () => {
					expect( spy ).to.have.been.calledWithMatch( {
						type: PUSH_NOTIFICATIONS_RECEIVE_REGISTER_DEVICE,
						data: {},
					} );
				} );
			} );
		} );
	} );
} );
