/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import getLostFocusTimestamp from '../get-lostfocus-timestamp';

// Simulate the time Feb 27, 2017 05:25 UTC
const NOW = 1488173100125;

describe( '#getLostFocusTimestamp', () => {
	test( 'returns the current timestamp', () => {
		const state = deepFreeze( { happychat: { ui: { lostFocusAt: NOW } } } );
		expect( getLostFocusTimestamp( state ) ).to.eql( NOW );
	} );
} );
