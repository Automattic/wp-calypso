/**
 * External dependencies
 */
import { expect } from 'chai';
import { stub } from 'sinon';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_CHAT_STATUS_ASSIGNED,
	HAPPYCHAT_CHAT_STATUS_PENDING,
} from 'extensions/happychat/state/selectors';
import sendEvent from '../index';
import getEventMessage from '../message-events';
import {
	ROUTE_SET,
} from 'state/action-types';

describe( 'sendEvent actions', () => {
	let connection;
	const action = { type: ROUTE_SET, path: '/me' };
	const state = {
		currentUser: {
			id: '2'
		},
		users: {
			items: {
				2: { username: 'Link' }
			}
		},
		extensions: {
			happychat: {
				connectionStatus: 'connected',
				isAvailable: true,
				chatStatus: HAPPYCHAT_CHAT_STATUS_ASSIGNED
			}
		}
	};

	beforeEach( () => {
		connection = { sendEvent: stub() };
	} );

	it( 'should not sent event message when client not connected', () => {
		const getState = () => Object.assign( {},
			state,
			{ extensions: { happychat: { connectionStatus: 'uninitialized' } } }
		);
		sendEvent( connection, getEventMessage )( { getState }, action );
		expect( connection.sendEvent ).to.not.have.been.called;
	} );

	it( 'should not sent event message when chat is not assigned', () => {
		const getState = () => Object.assign( {},
			state,
			{ extensions: { happychat: { chatStatus: HAPPYCHAT_CHAT_STATUS_PENDING } } }
		);
		sendEvent( connection, getEventMessage )( { getState }, action );
		expect( connection.sendEvent ).to.not.have.been.called;
	} );

	it( 'should sent event message when client connected and chat assigned', () => {
		const getState = () => state;
		sendEvent( connection, getEventMessage )( { getState }, action );
		expect( connection.sendEvent ).to.have.been.calledWith(
			'Looking at https://wordpress.com/me?support_user=Link'
		);
	} );
} );
