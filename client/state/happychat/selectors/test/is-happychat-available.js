/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import isHappychatAvailable from '../is-happychat-available';

describe( '#isHappychatAvailable', () => {
	it( "should be false if there's no active connection", () => {
		const state = deepFreeze( {
			happychat: {
				connection: {
					status: 'uninitialized',
					isAvailable: true,
				},
			},
		} );
		expect( isHappychatAvailable( state ) ).to.be.false;
	} );

	it( "should be false if Happychat isn't accepting new connections", () => {
		const state = deepFreeze( {
			happychat: {
				connection: {
					status: 'connected',
					isAvailable: false,
				},
			},
		} );
		expect( isHappychatAvailable( state ) ).to.be.false;
	} );

	it( "should be true when there's a connection and connections are being accepted", () => {
		const state = deepFreeze( {
			happychat: {
				connection: {
					status: 'connected',
					isAvailable: true,
				},
			},
		} );
		expect( isHappychatAvailable( state ) ).to.be.true;
	} );
} );
