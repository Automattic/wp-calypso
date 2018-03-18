/** @format */

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
} from 'state/happychat/constants';
import hasHappychatLocalizedSupport from 'state/happychat/selectors/has-happychat-localized-support';

describe( '#hasHappychatLocalizedSupport', () => {
	it( "should be false if there's no active connection", () => {
		const state = deepFreeze( {
			happychat: {
				connection: {
					status: HAPPYCHAT_CONNECTION_STATUS_UNINITIALIZED,
					localizedSupport: true,
				},
			},
		} );
		expect( hasHappychatLocalizedSupport( state ) ).to.be.false;
	} );

	it( "should be false if Happychat isn't accepting new localized chat connections", () => {
		const state = deepFreeze( {
			happychat: {
				connection: {
					status: HAPPYCHAT_CONNECTION_STATUS_CONNECTED,
					localizedSupport: false,
				},
			},
		} );
		expect( hasHappychatLocalizedSupport( state ) ).to.be.false;
	} );

	it( "should be true when there's a connection and connections are being accepted", () => {
		const state = deepFreeze( {
			happychat: {
				connection: {
					status: HAPPYCHAT_CONNECTION_STATUS_CONNECTED,
					localizedSupport: true,
				},
			},
		} );
		expect( hasHappychatLocalizedSupport( state ) ).to.be.true;
	} );
} );
