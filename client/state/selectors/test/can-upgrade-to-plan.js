import {
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_ECOMMERCE_3_YEARS,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_JETPACK_FREE,
	PLAN_PERSONAL,
	PLAN_BLOGGER,
	PLAN_PREMIUM,
} from '@automattic/calypso-products';
import canUpgradeToPlan from 'calypso/state/selectors/can-upgrade-to-plan';

describe( 'canUpgradeToPlan', () => {
	const siteId = 1234567;

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
			[ PLAN_ECOMMERCE, PLAN_ECOMMERCE_2_YEARS, PLAN_ECOMMERCE_3_YEARS ].forEach(
				( planToPurchase ) => {
					expect( canUpgradeToPlan( atomicFreeState, siteId, planToPurchase ) ).toBe( false );
				}
			);
		} );

		test( 'should return true for atomic v2 site when upgrading to eCommerce', () => {
			const atomicV2State = {
				...atomicFreeState,
			};
			atomicV2State.sites.items[ siteId ].options.is_wpcom_atomic = true;

			[ PLAN_ECOMMERCE, PLAN_ECOMMERCE_2_YEARS, PLAN_ECOMMERCE_3_YEARS ].forEach(
				( planToPurchase ) => {
					expect( canUpgradeToPlan( atomicV2State, siteId, planToPurchase ) ).toBe( true );
				}
			);
		} );

		test( 'should return false for atomic site without a plan to other plans', () => {
			[ PLAN_BLOGGER, PLAN_PERSONAL, PLAN_PREMIUM ].forEach( ( planToPurchase ) => {
				expect( canUpgradeToPlan( atomicFreeState, siteId, planToPurchase ) ).toBe( false );
			} );
		} );
	} );
} );
