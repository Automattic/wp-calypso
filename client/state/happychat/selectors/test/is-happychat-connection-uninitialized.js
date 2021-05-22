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
import isHappychatConnectionUninitialized from '../is-happychat-connection-uninitialized';

describe( '#isHappychatConnectionUninitialized', () => {
	it( 'should return true for UNINITIALIZED', () => {
		const stateUnitialized = deepFreeze( {
			happychat: {
				connection: {
					status: HAPPYCHAT_CONNECTION_STATUS_UNINITIALIZED,
				},
			},
		} );
		expect( isHappychatConnectionUninitialized( stateUnitialized ) ).to.be.true;
	} );

	it( 'should return false for CONNECTED', () => {
		const stateConnected = deepFreeze( {
			happychat: {
				connection: {
					status: HAPPYCHAT_CONNECTION_STATUS_CONNECTED,
				},
			},
		} );
		expect( isHappychatConnectionUninitialized( stateConnected ) ).to.be.false;
	} );

	it( 'should return false for DISCONNECTED', () => {
		const stateDisconnected = deepFreeze( {
			happychat: {
				connection: {
					status: HAPPYCHAT_CONNECTION_STATUS_DISCONNECTED,
				},
			},
		} );
		expect( isHappychatConnectionUninitialized( stateDisconnected ) ).to.be.false;
	} );

	it( 'should return false for CONNECTING', () => {
		const stateConnecting = deepFreeze( {
			happychat: {
				connection: {
					status: HAPPYCHAT_CONNECTION_STATUS_CONNECTING,
				},
			},
		} );
		expect( isHappychatConnectionUninitialized( stateConnecting ) ).to.be.false;
	} );

	it( 'should return false for RECONNECTING', () => {
		const stateReconnecting = deepFreeze( {
			happychat: {
				connection: {
					status: HAPPYCHAT_CONNECTION_STATUS_RECONNECTING,
				},
			},
		} );
		expect( isHappychatConnectionUninitialized( stateReconnecting ) ).to.be.false;
	} );
} );
