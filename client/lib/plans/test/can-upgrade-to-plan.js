/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { canUpgradeToPlan } from '..';
import { PLAN_BUSINESS, PLAN_FREE, PLAN_JETPACK_BUSINESS, PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY, PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_PERSONAL, PLAN_PREMIUM } from '../constants';

describe( 'canUpgradeToPlan', () => {
	const makeSite = productSlug => ( {
		plan: { product_slug: productSlug },
	} );

	it( 'should return true from lower-tier plans to higher-tier plans', () => {
		[
			[ PLAN_FREE, PLAN_BUSINESS ],
			[ PLAN_FREE, PLAN_PERSONAL ],
			[ PLAN_FREE, PLAN_PREMIUM ],
			[ PLAN_JETPACK_FREE, PLAN_JETPACK_BUSINESS ],
			[ PLAN_JETPACK_FREE, PLAN_JETPACK_BUSINESS_MONTHLY ],
			[ PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL ],
			[ PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL_MONTHLY ],
			[ PLAN_JETPACK_FREE, PLAN_JETPACK_PREMIUM ],
			[ PLAN_JETPACK_FREE, PLAN_JETPACK_PREMIUM_MONTHLY ],
			[ PLAN_JETPACK_PERSONAL, PLAN_JETPACK_BUSINESS ],
			[ PLAN_JETPACK_PERSONAL, PLAN_JETPACK_BUSINESS_MONTHLY ],
			[ PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PREMIUM ],
			[ PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PREMIUM_MONTHLY ],
			[ PLAN_JETPACK_PERSONAL_MONTHLY, PLAN_JETPACK_BUSINESS ],
			[ PLAN_JETPACK_PERSONAL_MONTHLY, PLAN_JETPACK_BUSINESS_MONTHLY ],
			[ PLAN_JETPACK_PERSONAL_MONTHLY, PLAN_JETPACK_PREMIUM ],
			[ PLAN_JETPACK_PERSONAL_MONTHLY, PLAN_JETPACK_PREMIUM_MONTHLY ],
			[ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_BUSINESS ],
			[ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_BUSINESS_MONTHLY ],
			[ PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_JETPACK_BUSINESS ],
			[ PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_JETPACK_BUSINESS_MONTHLY ],
			[ PLAN_PERSONAL, PLAN_BUSINESS ],
			[ PLAN_PERSONAL, PLAN_PREMIUM ],
			[ PLAN_PREMIUM, PLAN_BUSINESS ],
		].forEach(
			( [ planOwned, planToPurchase ] ) =>
				expect( canUpgradeToPlan( planToPurchase, makeSite( planOwned ) ) ).to.be.true
		);
	} );

	it( 'should return true from monthly plans to yearly plans', () => {
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
		[
			[ PLAN_BUSINESS, PLAN_FREE ],
			[ PLAN_BUSINESS, PLAN_PERSONAL ],
			[ PLAN_BUSINESS, PLAN_PREMIUM ],
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_FREE ],
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_PERSONAL ],
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_PERSONAL_MONTHLY ],
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_PREMIUM ],
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_PREMIUM_MONTHLY ],
			[ PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_FREE ],
			[ PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_PERSONAL ],
			[ PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_PERSONAL_MONTHLY ],
			[ PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_PREMIUM ],
			[ PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_PREMIUM_MONTHLY ],
			[ PLAN_JETPACK_PERSONAL, PLAN_JETPACK_FREE ],
			[ PLAN_JETPACK_PERSONAL_MONTHLY, PLAN_JETPACK_FREE ],
			[ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_FREE ],
			[ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PERSONAL ],
			[ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PERSONAL_MONTHLY ],
			[ PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_JETPACK_FREE ],
			[ PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_JETPACK_PERSONAL ],
			[ PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_JETPACK_PERSONAL_MONTHLY ],
			[ PLAN_PERSONAL, PLAN_FREE ],
			[ PLAN_PREMIUM, PLAN_FREE ],
			[ PLAN_PREMIUM, PLAN_PERSONAL ],
		].forEach(
			( [ planOwned, planToPurchase ] ) =>
				expect( canUpgradeToPlan( planToPurchase, makeSite( planOwned ) ) ).to.be.false
		);
	} );

	it( 'should return true from high-tier expired plans to lower-tier plans', () => {
		const makeComplexSite = ( productSlug, isJetpack, isAtomic ) => ( {
			jetpack: isJetpack || isAtomic,
			options: {
				is_automated_transfer: isAtomic,
			},
			plan: {
				product_slug: productSlug,
				expired: true,
			},
		} );
		[
			[ PLAN_BUSINESS, PLAN_PERSONAL, false, false ],
			[ PLAN_BUSINESS, PLAN_PERSONAL, false, true ],
			[ PLAN_BUSINESS, PLAN_PREMIUM, false, false ],
			[ PLAN_BUSINESS, PLAN_PREMIUM, false, true ],
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_PERSONAL, true, false ],
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_PERSONAL_MONTHLY, true, false ],
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_PREMIUM, true, false ],
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_PREMIUM_MONTHLY, true, false ],
			[ PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_PERSONAL, true, false ],
			[ PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_PERSONAL_MONTHLY, true, false ],
			[ PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_PREMIUM, true, false ],
			[ PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_PREMIUM_MONTHLY, true, false ],
			[ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PERSONAL, true, false ],
			[ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PERSONAL_MONTHLY, true, false ],
			[ PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_JETPACK_PERSONAL, true, false ],
			[ PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_JETPACK_PERSONAL_MONTHLY, true, false ],
			[ PLAN_PREMIUM, PLAN_PERSONAL, false, false ],
			[ PLAN_PREMIUM, PLAN_PERSONAL, false, true ],
		].forEach(
			( [ planOwned, planToPurchase, isJetpack, isAtomic ] ) =>
				expect(
					canUpgradeToPlan( planToPurchase, makeComplexSite( planOwned, isJetpack, isAtomic ) )
				).to.be.true
		);
	} );
} );
