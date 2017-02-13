/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { eligibleForFreeToPaidUpsell } from '..';

describe( 'eligibleForFreeToPaidUpsell', () => {
	it( 'should always return true', () => {
		const state = deepFreeze( {} );
		const eligible = eligibleForFreeToPaidUpsell( state, 'site1' );
		expect( eligible ).to.be.true;
	} );
} );
