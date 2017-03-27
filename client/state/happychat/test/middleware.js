/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { spy, stub } from 'sinon';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_SEND_BROWSER_INFO,
	HAPPYCHAT_SEND_MESSAGE,
	HAPPYCHAT_SET_MESSAGE,
	HAPPYCHAT_TRANSCRIPT_RECEIVE,
} from 'state/action-types';
import middleware, { requestTranscript } from '../middleware';

describe( 'middleware', () => {
	describe( 'HAPPYCHAT_SET_MESSAGE action', () => {
		it( 'should send relevant browser information to the connection', () => {
			const action = { type: HAPPYCHAT_SEND_BROWSER_INFO, siteUrl: 'http://butt.holdings/' };
			const connection = { info: spy() };
			middleware( connection )()( spy() )( action );

			expect( connection.info ).to.have.been.calledOnce;
			expect( connection.info.firstCall.args[ 0 ].text ).to.include( action.siteUrl );
		} );
	} );

	describe( 'HAPPYCHAT_SEND_MESSAGE action', () => {
		it( 'should send the message through the connection and send a notTyping signal', () => {
			const action = { type: HAPPYCHAT_SEND_MESSAGE, message: 'Hello world' };
			const connection = {
				send: spy(),
				notTyping: spy(),
			};
			middleware( connection )()( noop )( action );
			expect( connection.send ).to.have.been.calledWith( action.message );
			expect( connection.notTyping ).to.have.been.calledOnce;
		} );
	} );

	describe( 'HAPPYCHAT_SET_MESSAGE action', () => {
		it( 'should send the connection a typing signal when a message is present', () => {
			const action = { type: HAPPYCHAT_SET_MESSAGE, message: 'Hello world' };
			const connection = { typing: spy() };
			middleware( connection )()( noop )( action );
			expect( connection.typing ).to.have.been.calledWith( action.message );
		} );
		it( 'should send the connection a notTyping signal when the message is blank', () => {
			const action = { type: HAPPYCHAT_SET_MESSAGE, message: '' };
			const connection = { notTyping: spy() };
			middleware( connection )()( noop )( action );
			expect( connection.notTyping ).to.have.been.calledOnce;
		} );
	} );

	describe( 'HAPPYCHAT_TRANSCRIPT_REQUEST action', () => {
		it( 'should fetch transcript from connection and dispatch receive action', () => {
			const state = deepFreeze( {
				happychat: {
					timeline: []
				}
			} );
			const response = {
				messages: [
					{ text: 'hello' }
				],
				timestamp: 100000,
			};

			const connection = { transcript: stub().returns( Promise.resolve( response ) ) };
			const dispatch = stub();
			const getState = stub().returns( state );

			return requestTranscript( connection, { getState, dispatch } )
				.then( () => {
					expect( connection.transcript ).to.have.been.called;

					expect( dispatch ).to.have.been.calledWith( {
						type: HAPPYCHAT_TRANSCRIPT_RECEIVE,
						...response,
					} );
				} );
		} );
	} );
} );
