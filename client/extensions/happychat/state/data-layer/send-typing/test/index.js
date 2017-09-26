/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_SET_MESSAGE,
} from 'state/action-types';
import sendTyping from '../index';

describe( 'HAPPYCHAT_SET_MESSAGE action', () => {
	it( 'should send the connection a typing signal when a message is present', () => {
		const action = { type: HAPPYCHAT_SET_MESSAGE, message: 'Hello world' };
		const connection = { typing: spy() };
		sendTyping( connection )( { getState: noop }, action );
		expect( connection.typing ).to.have.been.calledWith( action.message );
	} );

	it( 'should send the connection a notTyping signal when the message is blank', () => {
		const action = { type: HAPPYCHAT_SET_MESSAGE, message: '' };
		const connection = { notTyping: spy() };
		sendTyping( connection )( { getState: noop }, action );
		expect( connection.notTyping ).to.have.been.calledOnce;
	} );
} );
