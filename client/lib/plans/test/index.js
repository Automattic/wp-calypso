/**
 * External Dependencies
 */
import { expect } from 'chai';

/**
 * Internal Dependencies
 */
import { isPlanMatch } from '..';
import {
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
} from '../constants';

describe( 'isPlanMatch', () => {
	it( 'should return true for identical plans', () => {
		expect( isPlanMatch( PLAN_JETPACK_BUSINESS, PLAN_JETPACK_BUSINESS ) ).to.be.true;
	} );

	it( 'should return true for matching plans', () => {
		const matchingPlans = [
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_BUSINESS_MONTHLY ],
			[ PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY ],
			[ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PREMIUM_MONTHLY ],
			[ PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_BUSINESS ],
			[ PLAN_JETPACK_PERSONAL_MONTHLY, PLAN_JETPACK_PERSONAL ],
			[ PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_JETPACK_PREMIUM ],
		];
		matchingPlans.forEach(
			( [ slugA, slugB ] ) => expect( isPlanMatch( slugA, slugB ) ).to.be.true
		);
	} );

	it( 'should return false for non-matching plans', () => {
		expect( isPlanMatch( PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PERSONAL ) ).to.be.false;
	} );
} );
