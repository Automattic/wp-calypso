/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { calculatePlan } from '../utils' ;
import {
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
} from 'lib/plans/constants';

describe( 'utils', () => {
	describe( 'calculatePlan', () => {
		it( 'should return null for unknown flow types', () => {
			expect( calculatePlan( 'not a flow type', 'yearly' ) ).to.be.null;
		} );
		it( 'should return null for unknown intervals', () => {
			expect( calculatePlan( 'pro', 'not an interval' ) ).to.be.null;
		} );
		it( 'should return the correct slug for flowType and interval', () => {
			const argsExpect = [
				[ [ 'personal', 'monthly' ], PLAN_JETPACK_PERSONAL_MONTHLY ],
				[ [ 'personal', 'yearly' ], PLAN_JETPACK_PERSONAL ],
				[ [ 'premium', 'monthly' ], PLAN_JETPACK_PREMIUM_MONTHLY ],
				[ [ 'premium', 'yearly' ], PLAN_JETPACK_PREMIUM ],
				[ [ 'pro', 'monthly' ], PLAN_JETPACK_BUSINESS_MONTHLY ],
				[ [ 'pro', 'yearly' ], PLAN_JETPACK_BUSINESS ],
			];
			argsExpect
				.forEach( ( [ [ flowType, interval ], expectedPlan ] ) =>
					expect( calculatePlan( flowType, interval ) ).to.equal( expectedPlan )
				);
		} );
	} );
} );
