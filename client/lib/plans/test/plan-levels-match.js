/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { planLevelsMatch } from '..';
import { PLAN_BUSINESS, PLAN_FREE, PLAN_JETPACK_BUSINESS, PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY, PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_PERSONAL, PLAN_PREMIUM } from '../constants';

describe( 'planLevelsMatch', () => {
	const testPlansArrayIndependentOfOrder = ( plansArray, result ) =>
		plansArray.forEach( ( [ slugA, slugB ] ) => {
			expect( planLevelsMatch( slugA, slugB ) ).to.be[ result ];
			expect( planLevelsMatch( slugB, slugA ) ).to.be[ result ];
		} );

	it( 'should return true for identical plans', () => {
		const identicalPlans = [
			[ PLAN_BUSINESS, PLAN_BUSINESS ],
			[ PLAN_FREE, PLAN_FREE ],
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_BUSINESS ],
			[ PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_BUSINESS_MONTHLY ],
			[ PLAN_JETPACK_FREE, PLAN_JETPACK_FREE ],
			[ PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL ],
			[ PLAN_JETPACK_PERSONAL_MONTHLY, PLAN_JETPACK_PERSONAL_MONTHLY ],
			[ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PREMIUM ],
			[ PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_JETPACK_PREMIUM_MONTHLY ],
			[ PLAN_PERSONAL, PLAN_PERSONAL ],
			[ PLAN_PREMIUM, PLAN_PREMIUM ],
		];
		testPlansArrayIndependentOfOrder( identicalPlans, 'true' );
	} );

	it( 'should return true for matching plans', () => {
		const matchingPlans = [
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_BUSINESS_MONTHLY ],
			[ PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY ],
			[ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PREMIUM_MONTHLY ],
		];
		testPlansArrayIndependentOfOrder( matchingPlans, 'true' );
	} );

	it( 'should return false for non-matching plans', () => {
		const nonMatchingPlans = [
			[ PLAN_JETPACK_BUSINESS, PLAN_BUSINESS ],
			[ PLAN_JETPACK_BUSINESS, PLAN_FREE ],
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_PERSONAL_MONTHLY ],
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_PREMIUM_MONTHLY ],
			[ PLAN_JETPACK_BUSINESS, PLAN_PERSONAL ],
			[ PLAN_JETPACK_BUSINESS, PLAN_PREMIUM ],
			[ PLAN_JETPACK_PERSONAL, PLAN_BUSINESS ],
			[ PLAN_JETPACK_PERSONAL, PLAN_FREE ],
			[ PLAN_JETPACK_PERSONAL, PLAN_JETPACK_BUSINESS_MONTHLY ],
			[ PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PREMIUM_MONTHLY ],
			[ PLAN_JETPACK_PERSONAL, PLAN_PERSONAL ],
			[ PLAN_JETPACK_PERSONAL, PLAN_PREMIUM ],
			[ PLAN_JETPACK_PREMIUM, PLAN_BUSINESS ],
			[ PLAN_JETPACK_PREMIUM, PLAN_FREE ],
			[ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_BUSINESS_MONTHLY ],
			[ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PERSONAL_MONTHLY ],
			[ PLAN_JETPACK_PREMIUM, PLAN_PERSONAL ],
			[ PLAN_JETPACK_PREMIUM, PLAN_PREMIUM ],
		];
		testPlansArrayIndependentOfOrder( nonMatchingPlans, 'false' );
	} );
} );
