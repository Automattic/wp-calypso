/**
 * Internal dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import canUpgradeToPlan from 'state/selectors/can-upgrade-to-plan';
import {
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_BUSINESS_MONTHLY,
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
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
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
			[ PLAN_FREE, PLAN_BLOGGER ],
			[ PLAN_FREE, PLAN_BLOGGER_2_YEARS ],
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
			[ PLAN_BLOGGER, PLAN_BUSINESS ],
			[ PLAN_BLOGGER, PLAN_BUSINESS_2_YEARS ],
			[ PLAN_BLOGGER, PLAN_PREMIUM ],
			[ PLAN_BLOGGER, PLAN_PREMIUM_2_YEARS ],
			[ PLAN_BLOGGER, PLAN_PERSONAL ],
			[ PLAN_BLOGGER, PLAN_PERSONAL_2_YEARS ],
			[ PLAN_BLOGGER_2_YEARS, PLAN_BUSINESS ],
			[ PLAN_BLOGGER_2_YEARS, PLAN_BUSINESS_2_YEARS ],
			[ PLAN_BLOGGER_2_YEARS, PLAN_PREMIUM ],
			[ PLAN_BLOGGER_2_YEARS, PLAN_PREMIUM_2_YEARS ],
			[ PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL ],
			[ PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL_2_YEARS ],
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
			[ PLAN_BUSINESS_MONTHLY, PLAN_BUSINESS ],
			[ PLAN_BUSINESS_MONTHLY, PLAN_BUSINESS_2_YEARS ],
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
			[ PLAN_BUSINESS, PLAN_BUSINESS_MONTHLY ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_BUSINESS_MONTHLY ],
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
			[ PLAN_BLOGGER, PLAN_BLOGGER_2_YEARS ],
			[ PLAN_PERSONAL, PLAN_PERSONAL_2_YEARS ],
			[ PLAN_PREMIUM, PLAN_PREMIUM_2_YEARS ],
			[ PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS ],
			[ PLAN_ECOMMERCE, PLAN_ECOMMERCE_2_YEARS ],
		].forEach( ( [ planOwned, planToPurchase ] ) =>
			expect( canUpgradeToPlan( makeState( siteId, planOwned ), siteId, planToPurchase ) ).toBe(
				true
			)
		);
	} );

	test( 'should return false from 2-year plans to 1-year plans', () => {
		[
			[ PLAN_BLOGGER_2_YEARS, PLAN_BLOGGER ],
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
			[ PLAN_BUSINESS, PLAN_BLOGGER ],
			[ PLAN_BUSINESS, PLAN_PERSONAL ],
			[ PLAN_BUSINESS, PLAN_PREMIUM ],
			[ PLAN_BUSINESS_MONTHLY, PLAN_FREE ],
			[ PLAN_BUSINESS_MONTHLY, PLAN_BLOGGER ],
			[ PLAN_BUSINESS_MONTHLY, PLAN_PERSONAL ],
			[ PLAN_BUSINESS_MONTHLY, PLAN_PREMIUM ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_FREE ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_BLOGGER ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_BLOGGER_2_YEARS ],
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
			[ PLAN_BLOGGER, PLAN_FREE ],
			[ PLAN_BLOGGER_2_YEARS, PLAN_FREE ],
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
		const makeComplexState = ( s, productSlug, siteType ) => ( {
			sites: {
				items: {
					[ s ]: {
						jetpack: includes( [ 'jetpack', 'atomic' ], siteType ),
						options: {
							is_automated_transfer: siteType === 'atomic',
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
			[ PLAN_BUSINESS_MONTHLY, PLAN_BLOGGER, 'simple' ],
			[ PLAN_BUSINESS_MONTHLY, PLAN_BLOGGER, 'atomic' ],
			[ PLAN_BUSINESS_MONTHLY, PLAN_PERSONAL, 'simple' ],
			[ PLAN_BUSINESS_MONTHLY, PLAN_PERSONAL, 'atomic' ],
			[ PLAN_BUSINESS_MONTHLY, PLAN_PREMIUM, 'simple' ],
			[ PLAN_BUSINESS_MONTHLY, PLAN_PREMIUM, 'atomic' ],
			[ PLAN_BUSINESS, PLAN_BLOGGER, 'simple' ],
			[ PLAN_BUSINESS, PLAN_BLOGGER, 'atomic' ],
			[ PLAN_BUSINESS, PLAN_PERSONAL, 'simple' ],
			[ PLAN_BUSINESS, PLAN_PERSONAL, 'atomic' ],
			[ PLAN_BUSINESS, PLAN_PREMIUM, 'simple' ],
			[ PLAN_BUSINESS, PLAN_PREMIUM, 'atomic' ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_BLOGGER, 'simple' ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_BLOGGER, 'atomic' ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_BLOGGER_2_YEARS, 'simple' ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_BLOGGER_2_YEARS, 'atomic' ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_PERSONAL, 'simple' ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_PERSONAL, 'atomic' ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_PERSONAL_2_YEARS, 'simple' ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_PERSONAL_2_YEARS, 'atomic' ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_PREMIUM, 'simple' ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_PREMIUM, 'atomic' ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_PREMIUM_2_YEARS, 'simple' ],
			[ PLAN_BUSINESS_2_YEARS, PLAN_PREMIUM_2_YEARS, 'atomic' ],
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_PERSONAL, 'jetpack' ],
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_PERSONAL_MONTHLY, 'jetpack' ],
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_PREMIUM, 'jetpack' ],
			[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_PREMIUM_MONTHLY, 'jetpack' ],
			[ PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_PERSONAL, 'jetpack' ],
			[ PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_PERSONAL_MONTHLY, 'jetpack' ],
			[ PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_PREMIUM, 'jetpack' ],
			[ PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_PREMIUM_MONTHLY, 'jetpack' ],
			[ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PERSONAL, 'jetpack' ],
			[ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PERSONAL_MONTHLY, 'jetpack' ],
			[ PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_JETPACK_PERSONAL, 'jetpack' ],
			[ PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_JETPACK_PERSONAL_MONTHLY, 'jetpack' ],
			[ PLAN_PREMIUM, PLAN_PERSONAL, 'simple' ],
			[ PLAN_PREMIUM, PLAN_PERSONAL, 'atomic' ],
			[ PLAN_PREMIUM, PLAN_BLOGGER, 'simple' ],
			[ PLAN_PREMIUM, PLAN_BLOGGER, 'atomic' ],
			[ PLAN_PREMIUM_2_YEARS, PLAN_PERSONAL, 'simple' ],
			[ PLAN_PREMIUM_2_YEARS, PLAN_PERSONAL, 'atomic' ],
			[ PLAN_PREMIUM_2_YEARS, PLAN_BLOGGER, 'simple' ],
			[ PLAN_PREMIUM_2_YEARS, PLAN_BLOGGER, 'atomic' ],
			[ PLAN_PREMIUM_2_YEARS, PLAN_PERSONAL_2_YEARS, 'simple' ],
			[ PLAN_PREMIUM_2_YEARS, PLAN_PERSONAL_2_YEARS, 'atomic' ],
			[ PLAN_PERSONAL, PLAN_BLOGGER, 'simple' ],
			[ PLAN_PERSONAL, PLAN_BLOGGER, 'atomic' ],
			[ PLAN_PERSONAL_2_YEARS, PLAN_BLOGGER, 'simple' ],
			[ PLAN_PERSONAL_2_YEARS, PLAN_BLOGGER, 'atomic' ],
			[ PLAN_PERSONAL_2_YEARS, PLAN_BLOGGER_2_YEARS, 'simple' ],
			[ PLAN_PERSONAL_2_YEARS, PLAN_BLOGGER_2_YEARS, 'atomic' ],
		].forEach( ( [ planOwned, planToPurchase, siteType ] ) => {
			expect(
				canUpgradeToPlan( makeComplexState( siteId, planOwned, siteType ), siteId, planToPurchase )
			).toBe( true );
		} );
	} );

	describe( 'from expired atomic', () => {
		const atomicFreeState = {
			sites: {
				items: {
					[ siteId ]: {
						jetpack: true,
						options: {
							is_automated_transfer: true,
						},
						plan: {
							product_id: 2002,
							product_slug: PLAN_JETPACK_FREE,
						},
					},
				},
				plans: {
					[ siteId ]: {
						data: [
							{
								currentPlan: false,
								productSlug: PLAN_JETPACK_FREE,
							},
						],
					},
				},
			},
		};

		test( 'should return true for atomic site without a plan to business/', () => {
			[ PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS ].forEach( ( planToPurchase ) => {
				expect( canUpgradeToPlan( atomicFreeState, siteId, planToPurchase ) ).toBe( true );
			} );
		} );

		test( 'should return false for atomic v1 site when upgrading to eCommerce', () => {
			[ PLAN_ECOMMERCE, PLAN_ECOMMERCE_2_YEARS ].forEach( ( planToPurchase ) => {
				expect( canUpgradeToPlan( atomicFreeState, siteId, planToPurchase ) ).toBe( false );
			} );
		} );

		test( 'should return true for atomic v2 site when upgrading to eCommerce', () => {
			const atomicV2State = {
				...atomicFreeState,
			};
			atomicV2State.sites.items[ siteId ].options.is_wpcom_atomic = true;

			[ PLAN_ECOMMERCE, PLAN_ECOMMERCE_2_YEARS ].forEach( ( planToPurchase ) => {
				expect( canUpgradeToPlan( atomicV2State, siteId, planToPurchase ) ).toBe( true );
			} );
		} );

		test( 'should return false for atomic site without a plan to other plans', () => {
			[ PLAN_BLOGGER, PLAN_PERSONAL, PLAN_PREMIUM ].forEach( ( planToPurchase ) => {
				expect( canUpgradeToPlan( atomicFreeState, siteId, planToPurchase ) ).toBe( false );
			} );
		} );
	} );
} );
