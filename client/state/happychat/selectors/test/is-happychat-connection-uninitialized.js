/** @format */

/**
 * External dependencies
 */
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
} from 'state/happychat/constants';
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
		expect( isHappychatConnectionUninitialized( stateUnitialized ) ).toBeTruthy();
	} );

	it( 'should return false for CONNECTED', () => {
		const stateConnected = deepFreeze( {
			happychat: {
				connection: {
					status: HAPPYCHAT_CONNECTION_STATUS_CONNECTED,
				},
			},
		} );
		expect( isHappychatConnectionUninitialized( stateConnected ) ).toBeFalsy();
	} );

	it( 'should return false for DISCONNECTED', () => {
		const stateDisconnected = deepFreeze( {
			happychat: {
				connection: {
					status: HAPPYCHAT_CONNECTION_STATUS_DISCONNECTED,
				},
			},
		} );
		expect( isHappychatConnectionUninitialized( stateDisconnected ) ).toBeFalsy();
	} );

	it( 'should return false for CONNECTING', () => {
		const stateConnecting = deepFreeze( {
			happychat: {
				connection: {
					status: HAPPYCHAT_CONNECTION_STATUS_CONNECTING,
				},
			},
		} );
		expect( isHappychatConnectionUninitialized( stateConnecting ) ).toBeFalsy();
	} );

	it( 'should return false for RECONNECTING', () => {
		const stateReconnecting = deepFreeze( {
			happychat: {
				connection: {
					status: HAPPYCHAT_CONNECTION_STATUS_RECONNECTING,
				},
			},
		} );
		expect( isHappychatConnectionUninitialized( stateReconnecting ) ).toBeFalsy();
	} );
} );
