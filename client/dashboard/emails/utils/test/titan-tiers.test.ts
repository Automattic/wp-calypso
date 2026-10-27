import { TitanMailSlugs } from '@automattic/api-core';
import { IntervalLength, TitanPlanTier } from '../../types';
import {
	getTitanDowngradeTargetId,
	getTitanTierFromSlug,
	isHighestTitanTier,
	isLowerTitanTier,
} from '../titan-tiers';
import type { PlanProductDowngrade, Product } from '@automattic/api-core';

const PRODUCT_IDS: Record< string, number > = {
	[ TitanMailSlugs.TITAN_MAIL_MONTHLY_SLUG ]: 400,
	[ TitanMailSlugs.TITAN_MAIL_YEARLY_SLUG ]: 401,
	[ TitanMailSlugs.TITAN_MAIL_PREMIUM_MONTHLY_SLUG ]: 402,
	[ TitanMailSlugs.TITAN_MAIL_PREMIUM_YEARLY_SLUG ]: 403,
	[ TitanMailSlugs.TITAN_MAIL_ULTRA_MONTHLY_SLUG ]: 404,
	[ TitanMailSlugs.TITAN_MAIL_ULTRA_YEARLY_SLUG ]: 405,
};

/**
 * Products as the products endpoints actually return them today: no
 * `downgrade_paths`, since the endpoint allowlist drops the field.
 */
function makeProduct( slug: string, downgradePaths?: PlanProductDowngrade[] ): Product {
	return {
		product_slug: slug,
		product_id: PRODUCT_IDS[ slug ],
		...( downgradePaths ? { downgrade_paths: downgradePaths } : {} ),
	} as Product;
}

const ultraYearly = makeProduct( TitanMailSlugs.TITAN_MAIL_ULTRA_YEARLY_SLUG );
const premiumYearly = makeProduct( TitanMailSlugs.TITAN_MAIL_PREMIUM_YEARLY_SLUG );
const proYearly = makeProduct( TitanMailSlugs.TITAN_MAIL_YEARLY_SLUG );
const proMonthly = makeProduct( TitanMailSlugs.TITAN_MAIL_MONTHLY_SLUG );

describe( 'getTitanDowngradeTargetId', () => {
	// The fallback mirrors wpcom's Store::get_downgrade_paths() for Titan:
	// Premium -> Pro, Ultra -> Pro/Premium, same term only.
	describe( 'without server-declared downgrade paths', () => {
		test( 'resolves every strictly lower tier at the same term', () => {
			expect(
				getTitanDowngradeTargetId( {
					currentTier: TitanPlanTier.Ultra,
					currentProduct: ultraYearly,
					targetTier: TitanPlanTier.Premium,
					targetProduct: premiumYearly,
					interval: IntervalLength.Annually,
				} )
			).toBe( 403 );

			expect(
				getTitanDowngradeTargetId( {
					currentTier: TitanPlanTier.Ultra,
					currentProduct: ultraYearly,
					targetTier: TitanPlanTier.Pro,
					targetProduct: proYearly,
					interval: IntervalLength.Annually,
				} )
			).toBe( 401 );
		} );

		test( 'refuses the current tier and any higher tier', () => {
			expect(
				getTitanDowngradeTargetId( {
					currentTier: TitanPlanTier.Premium,
					currentProduct: premiumYearly,
					targetTier: TitanPlanTier.Premium,
					targetProduct: premiumYearly,
					interval: IntervalLength.Annually,
				} )
			).toBeUndefined();

			expect(
				getTitanDowngradeTargetId( {
					currentTier: TitanPlanTier.Pro,
					currentProduct: proYearly,
					targetTier: TitanPlanTier.Ultra,
					targetProduct: ultraYearly,
					interval: IntervalLength.Annually,
				} )
			).toBeUndefined();
		} );

		// The server rejects a cross-term pair with bad_request, so a product
		// loaded for the wrong term must never resolve as a target.
		test( 'refuses a target product from a different billing term', () => {
			expect(
				getTitanDowngradeTargetId( {
					currentTier: TitanPlanTier.Ultra,
					currentProduct: ultraYearly,
					targetTier: TitanPlanTier.Pro,
					targetProduct: proMonthly,
					interval: IntervalLength.Annually,
				} )
			).toBeUndefined();
		} );

		test( 'offers nothing when the target product has not loaded', () => {
			expect(
				getTitanDowngradeTargetId( {
					currentTier: TitanPlanTier.Ultra,
					currentProduct: ultraYearly,
					targetTier: TitanPlanTier.Pro,
					targetProduct: undefined,
					interval: IntervalLength.Annually,
				} )
			).toBeUndefined();
		} );

		test( 'offers nothing when there is no current subscription tier', () => {
			expect(
				getTitanDowngradeTargetId( {
					currentTier: undefined,
					currentProduct: undefined,
					targetTier: TitanPlanTier.Pro,
					targetProduct: proYearly,
					interval: IntervalLength.Annually,
				} )
			).toBeUndefined();
		} );
	} );

	// If wpcom ever exposes the field, it takes over with no client change.
	describe( 'with server-declared downgrade paths', () => {
		const declaredProYearly: PlanProductDowngrade = {
			product_id: 401,
			bill_period: 365,
			product_slug: TitanMailSlugs.TITAN_MAIL_YEARLY_SLUG,
			product_name: 'Professional Email Pro',
		};

		test( 'uses the declared target id', () => {
			expect(
				getTitanDowngradeTargetId( {
					currentTier: TitanPlanTier.Ultra,
					currentProduct: makeProduct( TitanMailSlugs.TITAN_MAIL_ULTRA_YEARLY_SLUG, [
						declaredProYearly,
					] ),
					targetTier: TitanPlanTier.Pro,
					targetProduct: proYearly,
					interval: IntervalLength.Annually,
				} )
			).toBe( 401 );
		} );

		// A declared list is exhaustive: an omitted tier is a refusal, so the
		// fallback must not quietly re-allow it.
		test( 'refuses a tier the declared list omits', () => {
			expect(
				getTitanDowngradeTargetId( {
					currentTier: TitanPlanTier.Ultra,
					currentProduct: makeProduct( TitanMailSlugs.TITAN_MAIL_ULTRA_YEARLY_SLUG, [
						declaredProYearly,
					] ),
					targetTier: TitanPlanTier.Premium,
					targetProduct: premiumYearly,
					interval: IntervalLength.Annually,
				} )
			).toBeUndefined();
		} );
	} );
} );

describe( 'isLowerTitanTier', () => {
	test( 'is true only for a strictly cheaper tier', () => {
		expect( isLowerTitanTier( TitanPlanTier.Pro, TitanPlanTier.Ultra ) ).toBe( true );
		expect( isLowerTitanTier( TitanPlanTier.Ultra, TitanPlanTier.Pro ) ).toBe( false );
		expect( isLowerTitanTier( TitanPlanTier.Pro, TitanPlanTier.Pro ) ).toBe( false );
		expect( isLowerTitanTier( TitanPlanTier.Pro, undefined ) ).toBe( false );
	} );
} );

describe( 'getTitanTierFromSlug', () => {
	test( 'maps every tier slug back to its tier', () => {
		expect( getTitanTierFromSlug( TitanMailSlugs.TITAN_MAIL_MONTHLY_SLUG ) ).toBe(
			TitanPlanTier.Pro
		);
		expect( getTitanTierFromSlug( TitanMailSlugs.TITAN_MAIL_PREMIUM_YEARLY_SLUG ) ).toBe(
			TitanPlanTier.Premium
		);
		expect( getTitanTierFromSlug( TitanMailSlugs.TITAN_MAIL_ULTRA_MONTHLY_SLUG ) ).toBe(
			TitanPlanTier.Ultra
		);
	} );

	test( 'returns undefined for a non-Titan slug', () => {
		expect( getTitanTierFromSlug( 'business-bundle' ) ).toBeUndefined();
		expect( getTitanTierFromSlug( undefined ) ).toBeUndefined();
	} );
} );

describe( 'isHighestTitanTier', () => {
	test( 'is true only for the top tier', () => {
		expect( isHighestTitanTier( TitanPlanTier.Ultra ) ).toBe( true );
		expect( isHighestTitanTier( TitanPlanTier.Premium ) ).toBe( false );
		expect( isHighestTitanTier( undefined ) ).toBe( false );
	} );
} );
