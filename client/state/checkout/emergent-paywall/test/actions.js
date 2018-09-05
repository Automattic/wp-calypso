/** @format */

/**
 * Internal dependencies
 */
import {
	requestEmergentPaywallConfiguration,
	emergentPaywallConfigurationReceive,
} from '../actions';
import { EMERGENT_PAYWALL_RECEIVE, EMERGENT_PAYWALL_REQUEST } from 'state/action-types';

describe( 'Emergent paywall actions', () => {
	test( '#requestEmergentPaywallConfiguration()', () => {
		expect( requestEmergentPaywallConfiguration() ).toEqual( {
			type: EMERGENT_PAYWALL_REQUEST,
		} );
	} );

	test( '#emergentPaywallConfigurationReceive()', () => {
		const action = emergentPaywallConfigurationReceive( { matts: 'carpets', neils: 'kneepads' } );
		expect( action ).toEqual( {
			type: EMERGENT_PAYWALL_RECEIVE,
			matts: 'carpets',
			neils: 'kneepads',
		} );
	} );
} );
