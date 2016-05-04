
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getPlans,
	isRequestingPlans
} from '../selectors';

/**
 * Fixture data
 */
import {
	PLANS_MAPPED as mapped_plans,
	getStateInstance
} from './fixture';

describe( 'selectors', () => {
	describe( '#getPlans()', () => {
		it( 'should return WordPress Plans array', () => {
			const state = getStateInstance();
			const plans = getPlans( state );

			const expectedPlans = mapped_plans;
			expect( plans ).to.eql( expectedPlans );
		} );
	} );

	describe( '#isRequestingPlans()', () => {
		it( 'should return requesting state of Plans', () => {
			const state = getStateInstance();
			const isRequesting = isRequestingPlans( state );
			expect( isRequesting ).to.eql( false );
		} );
	} );
} );
