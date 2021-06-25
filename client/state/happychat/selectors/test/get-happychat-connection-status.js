/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_CONNECTION_STATUS_UNINITIALIZED,
	HAPPYCHAT_CONNECTION_STATUS_CONNECTED,
	HAPPYCHAT_CONNECTION_STATUS_DISCONNECTED,
	HAPPYCHAT_CONNECTION_STATUS_CONNECTING,
	HAPPYCHAT_CONNECTION_STATUS_RECONNECTING,
} from 'calypso/state/happychat/constants';
import getHappychatConnectionStatus from '../get-happychat-connection-status';

describe( '#getConnectionStatus', () => {
	describe( 'should return proper connection status for', () => {
		it( 'UNINITIALIZED', () => {
			const stateUninitialized = deepFreeze( {
				happychat: {
					connection: {
						status: HAPPYCHAT_CONNECTION_STATUS_UNINITIALIZED,
					},
				},
			} );
			expect( getHappychatConnectionStatus( stateUninitialized ) ).to.equal(
				HAPPYCHAT_CONNECTION_STATUS_UNINITIALIZED
			);
		} );

		it( 'CONNECTED', () => {
			const stateConnected = deepFreeze( {
				happychat: {
					connection: {
						status: HAPPYCHAT_CONNECTION_STATUS_CONNECTED,
					},
				},
			} );
			expect( getHappychatConnectionStatus( stateConnected ) ).to.be.equals(
				HAPPYCHAT_CONNECTION_STATUS_CONNECTED
			);
		} );

		it( 'DISCONNECTED', () => {
			const stateDisconnected = deepFreeze( {
				happychat: {
					connection: {
						status: HAPPYCHAT_CONNECTION_STATUS_DISCONNECTED,
					},
				},
			} );
			expect( getHappychatConnectionStatus( stateDisconnected ) ).to.be.equals(
				HAPPYCHAT_CONNECTION_STATUS_DISCONNECTED
			);
		} );

		it( 'CONNECTING', () => {
			const stateConnecting = deepFreeze( {
				happychat: {
					connection: {
						status: HAPPYCHAT_CONNECTION_STATUS_CONNECTING,
					},
				},
			} );
			expect( getHappychatConnectionStatus( stateConnecting ) ).to.be.equals(
				HAPPYCHAT_CONNECTION_STATUS_CONNECTING
			);
		} );

		it( 'RECONNECTING', () => {
			const stateReconnecting = deepFreeze( {
				happychat: {
					connection: {
						status: HAPPYCHAT_CONNECTION_STATUS_RECONNECTING,
					},
				},
			} );
			expect( getHappychatConnectionStatus( stateReconnecting ) ).to.be.equals(
				HAPPYCHAT_CONNECTION_STATUS_RECONNECTING
			);
		} );
	} );
} );
