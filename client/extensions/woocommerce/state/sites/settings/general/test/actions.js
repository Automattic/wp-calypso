/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { fetchSettingsGeneral } from '../actions';
import { WOOCOMMERCE_SETTINGS_GENERAL_REQUEST } from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#fetchSettingsGeneral()', () => {
		const siteId = '123';
		test( 'should return an action', () => {
			const action = fetchSettingsGeneral( siteId );
			expect( action ).to.eql( { type: WOOCOMMERCE_SETTINGS_GENERAL_REQUEST, siteId } );
		} );
	} );
} );
