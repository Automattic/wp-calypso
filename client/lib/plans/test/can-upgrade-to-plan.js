/** @format */
/**
 * External Dependencies
 */
import { expect } from 'chai';

/**
 * Internal Dependencies
 */
import { canUpgradeToPlan } from '..';
import {
	PLAN_BUSINESS,
	PLAN_FREE,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
} from '../constants';

describe( 'canUpgradeToPlan', () => {
	it( 'should return true from lower-tier plans to higher-tier plans', () => {
		const makeSite = product_slug => ( {
			plan: { product_slug },
		} );

		[
			[ PLAN_FREE, PLAN_PERSONAL ],
			[ PLAN_PERSONAL, PLAN_PREMIUM ],
			[ PLAN_PREMIUM, PLAN_BUSINESS ],
			[ PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL ],
			[ PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PREMIUM ],
			[ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_BUSINESS ],
		].forEach(
			( [ planOwned, planToPurchase ] ) =>
				expect( canUpgradeToPlan( planToPurchase, makeSite( planOwned ) ) ).to.be.true
		);
	} );

	it( 'should return true from monthly plans to yearly plans', () => {
		const makeSite = product_slug => ( {
			plan: { product_slug },
		} );

		[
			[ PLAN_JETPACK_PERSONAL_MONTHLY, PLAN_JETPACK_PERSONAL ],
			[ PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_JETPACK_PREMIUM ],
			[ PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_BUSINESS ],
		].forEach(
			( [ planOwned, planToPurchase ] ) =>
				expect( canUpgradeToPlan( planToPurchase, makeSite( planOwned ) ) ).to.be.true
		);
	} );

	it( 'should return false from yearly plans to monthly plans', () => {
		const makeSite = product_slug => ( {
			plan: { product_slug },
		} );

		[
			[ PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY ],
			[ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PREMIUM_MONTHLY ],
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_BUSINESS_MONTHLY ],
		].forEach(
			( [ planOwned, planToPurchase ] ) =>
				expect( canUpgradeToPlan( planToPurchase, makeSite( planOwned ) ) ).to.be.false
		);
	} );

	it( 'should return false from high-tier plans to lower-tier plans', () => {
		const makeSite = product_slug => ( {
			plan: { product_slug },
		} );

		[
			[ PLAN_PERSONAL, PLAN_FREE ],
			[ PLAN_PREMIUM, PLAN_PERSONAL ],
			[ PLAN_BUSINESS, PLAN_PREMIUM ],
			[ PLAN_JETPACK_PERSONAL, PLAN_JETPACK_FREE ],
			[ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PERSONAL ],
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_PREMIUM ],
		].forEach(
			( [ planOwned, planToPurchase ] ) =>
				expect( canUpgradeToPlan( planToPurchase, makeSite( planOwned ) ) ).to.be.false
		);
	} );

	it( 'should return true from high-tier expired plans to lower-tier plans', () => {
		const makeSite = ( product_slug, isJetpack, isAtomic ) => ( {
			jetpack: isJetpack || isAtomic,
			options: {
				is_automated_transfer: isAtomic,
			},
			plan: {
				product_slug,
				expired: true,
			},
		} );
		[
			[ PLAN_BUSINESS, PLAN_PERSONAL, false, false ],
			[ PLAN_BUSINESS, PLAN_PREMIUM, false, false ],
			[ PLAN_BUSINESS, PLAN_PERSONAL, false, true ],
			[ PLAN_BUSINESS, PLAN_PREMIUM, false, true ],
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_PERSONAL, true, false ],
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_PREMIUM, true, false ],
		].forEach(
			( [ planOwned, planToPurchase, isJetpack, isAtomic ] ) =>
				expect( canUpgradeToPlan( planToPurchase, makeSite( planOwned, isJetpack, isAtomic ) ) ).to
					.be.true
		);
	} );
} );
