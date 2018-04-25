/** @format */

/**
 * Internal dependencies
 */
import { canUpgradeToPlan } from 'state/selectors';
import {
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_FREE,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
} from 'lib/plans/constants';

describe( 'canUpgradeToPlan', () => {
	const siteId = 1234567;
	const makeState = ( s, productSlug ) => ( {
		sites: {
			plans: {
				[ s ]: {
					data: [
						{
							currentPlan: true,
							productSlug,
						},
					],
				},
			},
		},
	} );

	test( 'should return true from lower-tier plans to higher-tier plans', () => {
		[
			[ PLAN_FREE, PLAN_BUSINESS ],
			[ PLAN_FREE, PLAN_BUSINESS_2_YEARS ],
			[ PLAN_FREE, PLAN_PERSONAL ],
			[ PLAN_FREE, PLAN_PERSONAL_2_YEARS ],
			[ PLAN_FREE, PLAN_PREMIUM ],
			[ PLAN_FREE, PLAN_PREMIUM_2_YEARS ],
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
			[ PLAN_PERSONAL, PLAN_BUSINESS_2_YEARS ],
			[ PLAN_PERSONAL, PLAN_PREMIUM ],
			[ PLAN_PERSONAL, PLAN_PREMIUM_2_YEARS ],
			[ PLAN_PERSONAL_2_YEARS, PLAN_BUSINESS ],
			[ PLAN_PERSONAL_2_YEARS, PLAN_BUSINESS_2_YEARS ],
			[ PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM ],
			[ PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS ],
			[ PLAN_PREMIUM, PLAN_BUSINESS ],
			[ PLAN_PREMIUM, PLAN_BUSINESS_2_YEARS ],
			[ PLAN_PREMIUM_2_YEARS, PLAN_BUSINESS ],
			[ PLAN_PREMIUM_2_YEARS, PLAN_BUSINESS_2_YEARS ],
		].forEach( ( [ planOwned, planToPurchase ] ) =>
			expect( canUpgradeToPlan( makeState( siteId, planOwned ), siteId, planToPurchase ) ).toBe(
				true
			)
		);
	} );

	test( 'should return true from monthly plans to yearly plans', () => {
		[
			[ PLAN_JETPACK_PERSONAL_MONTHLY, PLAN_JETPACK_PERSONAL ],
			[ PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_JETPACK_PREMIUM ],
			[ PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_BUSINESS ],
		].forEach( ( [ planOwned, planToPurchase ] ) =>
			expect( canUpgradeToPlan( makeState( siteId, planOwned ), siteId, planToPurchase ) ).toBe(
				true
			)
		);
	} );

	test( 'should return false from yearly plans to monthly plans', () => {
		[
			[ PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY ],
			[ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PREMIUM_MONTHLY ],
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_BUSINESS_MONTHLY ],
		].forEach( ( [ planOwned, planToPurchase ] ) =>
			expect( canUpgradeToPlan( makeState( siteId, planOwned ), siteId, planToPurchase ) ).toBe(
				false
			)
		);
	} );

	test( 'should return true from 1-year plans to 2-year plans', () => {
		[
			[ PLAN_PERSONAL, PLAN_PERSONAL_2_YEARS ],
			[ PLAN_PREMIUM, PLAN_PREMIUM_2_YEARS ],
			[ PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS ],
		].forEach( ( [ planOwned, planToPurchase ] ) =>
			expect( canUpgradeToPlan( makeState( siteId, planOwned ), siteId, planToPurchase ) ).toBe(
				true
			)
		);
	} );

	test( 'should return false from 2-year plans to 1-year plans', () => {
		[
			[ PLAN_PERSONAL_2_YEARS, PLAN_PERSONAL ],
			[ PLAN_PREMIUM_2_YEARS, PLAN_PREMIUM ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_BUSINESS ],
		].forEach( ( [ planOwned, planToPurchase ] ) =>
			expect( canUpgradeToPlan( makeState( siteId, planOwned ), siteId, planToPurchase ) ).toBe(
				false
			)
		);
	} );

	test( 'should return false from high-tier plans to lower-tier plans', () => {
		[
			[ PLAN_BUSINESS, PLAN_FREE ],
			[ PLAN_BUSINESS, PLAN_PERSONAL ],
			[ PLAN_BUSINESS, PLAN_PREMIUM ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_FREE ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_PERSONAL ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_PERSONAL_2_YEARS ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_PREMIUM ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_PREMIUM_2_YEARS ],
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
			[ PLAN_PERSONAL_2_YEARS, PLAN_FREE ],
			[ PLAN_PREMIUM, PLAN_FREE ],
			[ PLAN_PREMIUM, PLAN_PERSONAL ],
			[ PLAN_PREMIUM_2_YEARS, PLAN_FREE ],
			[ PLAN_PREMIUM_2_YEARS, PLAN_PERSONAL ],
			[ PLAN_PREMIUM_2_YEARS, PLAN_PERSONAL_2_YEARS ],
		].forEach( ( [ planOwned, planToPurchase ] ) =>
			expect( canUpgradeToPlan( makeState( siteId, planOwned ), siteId, planToPurchase ) ).toBe(
				false
			)
		);
	} );

	test( 'should return true from high-tier expired plans to lower-tier plans', () => {
		const makeComplexState = ( s, productSlug, isJetpack, isAtomic ) => ( {
			sites: {
				items: {
					[ s ]: {
						jetpack: isJetpack || isAtomic,
						options: {
							is_automated_transfer: isAtomic,
						},
					},
				},
				plans: {
					[ s ]: {
						data: [
							{
								currentPlan: true,
								expired: true,
								productSlug,
							},
						],
					},
				},
			},
		} );

		[
			[ PLAN_BUSINESS, PLAN_PERSONAL, false, false ],
			[ PLAN_BUSINESS, PLAN_PERSONAL, false, true ],
			[ PLAN_BUSINESS, PLAN_PREMIUM, false, false ],
			[ PLAN_BUSINESS, PLAN_PREMIUM, false, true ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_PERSONAL, false, false ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_PERSONAL, false, true ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_PERSONAL_2_YEARS, false, false ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_PERSONAL_2_YEARS, false, true ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_PREMIUM, false, false ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_PREMIUM, false, true ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_PREMIUM_2_YEARS, false, false ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_PREMIUM_2_YEARS, false, true ],
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
			[ PLAN_PREMIUM_2_YEARS, PLAN_PERSONAL, false, false ],
			[ PLAN_PREMIUM_2_YEARS, PLAN_PERSONAL, false, true ],
			[ PLAN_PREMIUM_2_YEARS, PLAN_PERSONAL_2_YEARS, false, false ],
			[ PLAN_PREMIUM_2_YEARS, PLAN_PERSONAL_2_YEARS, false, true ],
		].forEach( ( [ planOwned, planToPurchase, isJetpack, isAtomic ] ) => {
			expect(
				canUpgradeToPlan(
					makeComplexState( siteId, planOwned, isJetpack, isAtomic ),
					siteId,
					planToPurchase
				)
			).toBe( true );
		} );
	} );
} );
