/** @format */

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { EMERGENT_PAYWALL_RECEIVE } from 'state/action-types';

describe( 'reducer', () => {
	test( 'should include expected keys and values in return value', () => {
		expect(
			reducer( undefined, {
				type: EMERGENT_PAYWALL_RECEIVE,
				charge_id: '321',
				payload: {},
				signature: '123',
				paywall_url: 'http://payload',
			} )
		).toEqual( {
			chargeId: '321',
			payload: {},
			signature: '123',
			url: 'http://payload',
		} );
	} );
} );
