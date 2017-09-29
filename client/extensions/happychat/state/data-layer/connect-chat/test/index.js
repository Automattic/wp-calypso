/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import wpcom from 'lib/wp';
import {
	HAPPYCHAT_CONNECTED,
	HAPPYCHAT_CONNECTING,
	HAPPYCHAT_DISCONNECTED,
	HAPPYCHAT_RECEIVE_EVENT,
	HAPPYCHAT_RECONNECTING,
	HAPPYCHAT_SET_AVAILABLE,
	HAPPYCHAT_SET_CHAT_STATUS,
	HAPPYCHAT_TRANSCRIPT_REQUEST,
} from 'extensions/happychat/state/action-types';
import connectChat from '../index';

describe( 'HAPPYCHAT_CONNECT action', () => {
	// TODO: Add tests for cases outside the happy path
	let connection;
	let dispatch, getState;
	const uninitializedState = deepFreeze( {
		currentUser: { id: 1, capabilities: {} },
		extensions: { happychat: { connectionStatus: 'uninitialized' } },
		users: { items: { 1: {} } },
		help: { selectedSiteId: 2647731 },
		sites: {
			items: {
				2647731: {
					ID: 2647731,
					name: 'Manual Automattic Updates',
				}
			}
		}
	} );

	useSandbox( sandbox => {
		connection = {
			on: sandbox.stub(),
			open: sandbox.stub().returns( Promise.resolve() )
		};
		// Need to add return value after re-assignment, otherwise it will return
		// a reference to the previous (undefined) connection variable.
		connection.on.returns( connection );

		dispatch = sandbox.stub();
		getState = sandbox.stub();
		sandbox.stub( wpcom, 'request', ( args, callback ) => callback( null, {} ) );
	} );

	it( 'should not attempt to connect when Happychat has been initialized', () => {
		const connectedState = { extensions: { happychat: { connectionStatus: 'connected' } } };
		const connectingState = { extensions: { happychat: { connectionStatus: 'connecting' } } };

		return Promise.all( [
			connectChat( connection )( { dispatch, getState: getState.returns( connectedState ) } ),
			connectChat( connection )( { dispatch, getState: getState.returns( connectingState ) } ),
		] ).then( () => expect( connection.on ).not.to.have.been.called );
	} );

	describe( 'when Happychat is uninitialized', () => {
		before( () => {
			getState.returns( uninitializedState );
		} );

		it( 'should attempt to connect', () => {
			getState.returns( uninitializedState );
			return connectChat( connection )( { dispatch, getState } )
				.then( () => {
					expect( connection.open ).to.have.been.calledOnce;
					expect( dispatch ).to.have.been.calledWith( { type: HAPPYCHAT_CONNECTING } );
				} );
		} );

		it( 'should set up listeners for various connection events', () => {
			return connectChat( connection )( { dispatch, getState } )
				.then( () => {
					expect( connection.on.callCount ).to.equal( 6 );

					// Ensure 'connect' listener was connected by executing a fake message event
					connection.on.withArgs( 'connected' ).firstCall.args[ 1 ]( true );
					expect( dispatch ).to.have.been.calledWith( { type: HAPPYCHAT_CONNECTED } );
					expect( dispatch ).to.have.been.calledWith( { type: HAPPYCHAT_TRANSCRIPT_REQUEST } );

					// Ensure 'disconnect' listener was connected by executing a fake message event
					connection.on.withArgs( 'disconnect' ).firstCall.args[ 1 ]( 'abc' );
					expect( dispatch ).to.have.been.calledWith( { type: HAPPYCHAT_DISCONNECTED, errorStatus: 'abc' } );

					// Ensure 'reconnecting' listener was connected by executing a fake message event
					connection.on.withArgs( 'reconnecting' ).firstCall.args[ 1 ]();
					expect( dispatch ).to.have.been.calledWith( { type: HAPPYCHAT_RECONNECTING } );

					// Ensure 'accept' listener was connected by executing a fake message event
					connection.on.withArgs( 'accept' ).firstCall.args[ 1 ]( true );
					expect( dispatch ).to.have.been.calledWith( { type: HAPPYCHAT_SET_AVAILABLE, isAvailable: true } );

					// Ensure 'message' listener was connected by executing a fake message event
					connection.on.withArgs( 'message' ).firstCall.args[ 1 ]( 'some event' );
					expect( dispatch ).to.have.been.calledWith( { type: HAPPYCHAT_RECEIVE_EVENT, event: 'some event' } );

					// Ensure 'message' listener was connected by executing a fake message event
					connection.on.withArgs( 'status' ).firstCall.args[ 1 ]( 'ready' );
					expect( dispatch ).to.have.been.calledWith( { type: HAPPYCHAT_SET_CHAT_STATUS, status: 'ready' } );
				} );
		} );
	} );
} );
