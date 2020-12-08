/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_CONNECTION_ERROR_FORCED_CLOSE,
	HAPPYCHAT_CONNECTION_ERROR_PING_TIMEOUT,
	HAPPYCHAT_CONNECTION_ERROR_TRANSPORT_CLOSE,
	HAPPYCHAT_CONNECTION_ERROR_TRANSPORT_ERROR,
} from 'calypso/state/happychat/constants';
import isHappychatServerReachable from '../is-happychat-server-reachable';

describe( '#isHappychatServerReachable', () => {
	it( 'should return true if there is no error', () => {
		const state = deepFreeze( {
			happychat: {
				connection: {
					error: null,
				},
			},
		} );
		expect( isHappychatServerReachable( state ) ).to.be.true;
	} );

	it( 'should return true if error is: Forced Close', () => {
		const state = deepFreeze( {
			happychat: {
				connection: {
					error: HAPPYCHAT_CONNECTION_ERROR_FORCED_CLOSE,
				},
			},
		} );
		expect( isHappychatServerReachable( state ) ).to.be.true;
	} );

	it( 'should return true if error is: Transport Close', () => {
		const state = deepFreeze( {
			happychat: {
				connection: {
					error: HAPPYCHAT_CONNECTION_ERROR_TRANSPORT_CLOSE,
				},
			},
		} );
		expect( isHappychatServerReachable( state ) ).to.be.true;
	} );

	it( 'should return true if error is: Transport Error', () => {
		const state = deepFreeze( {
			happychat: {
				connection: {
					error: HAPPYCHAT_CONNECTION_ERROR_TRANSPORT_ERROR,
				},
			},
		} );
		expect( isHappychatServerReachable( state ) ).to.be.true;
	} );

	it( 'should return false if error is: Ping Timeout', () => {
		const state = deepFreeze( {
			happychat: {
				connection: {
					error: HAPPYCHAT_CONNECTION_ERROR_PING_TIMEOUT,
				},
			},
		} );
		expect( isHappychatServerReachable( state ) ).to.be.false;
	} );
} );
