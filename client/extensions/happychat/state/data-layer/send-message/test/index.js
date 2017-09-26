/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_SEND_MESSAGE,
} from 'state/action-types';
import sendMessage from '../index';

describe( 'HAPPYCHAT_SEND_MESSAGE action', () => {
	it( 'should send the message through the connection and send a notTyping signal', () => {
		const action = { type: HAPPYCHAT_SEND_MESSAGE, message: 'Hello world' };
		const connection = {
			send: spy(),
			notTyping: spy(),
		};
		sendMessage( connection )( { getState: ( ) => { } }, action );
		expect( connection.send ).to.have.been.calledWith( action.message );
		expect( connection.notTyping ).to.have.been.calledOnce;
	} );
} );
