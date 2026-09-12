import { TitanMailSlugs } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { IntervalLength, TitanPlanTier } from '../types';
import type { Product } from '@automattic/api-core';

export const TITAN_TIER_SLUGS: Record< TitanPlanTier, Record< IntervalLength, string > > = {
	[ TitanPlanTier.Pro ]: {
		[ IntervalLength.Monthly ]: TitanMailSlugs.TITAN_MAIL_MONTHLY_SLUG,
		[ IntervalLength.Annually ]: TitanMailSlugs.TITAN_MAIL_YEARLY_SLUG,
	},
	[ TitanPlanTier.Premium ]: {
		[ IntervalLength.Monthly ]: TitanMailSlugs.TITAN_MAIL_PREMIUM_MONTHLY_SLUG,
		[ IntervalLength.Annually ]: TitanMailSlugs.TITAN_MAIL_PREMIUM_YEARLY_SLUG,
	},
	[ TitanPlanTier.Ultra ]: {
		[ IntervalLength.Monthly ]: TitanMailSlugs.TITAN_MAIL_ULTRA_MONTHLY_SLUG,
		[ IntervalLength.Annually ]: TitanMailSlugs.TITAN_MAIL_ULTRA_YEARLY_SLUG,
	},
};

// Tiers from cheapest to most expensive.
export const TITAN_TIER_ORDER: TitanPlanTier[] = [
	TitanPlanTier.Pro,
	TitanPlanTier.Premium,
	TitanPlanTier.Ultra,
];

export function isTitanPlanTier( value: unknown ): value is TitanPlanTier {
	return Object.values( TitanPlanTier ).includes( value as TitanPlanTier );
}

export function getTitanTierName( tier: TitanPlanTier ): string {
	switch ( tier ) {
		case TitanPlanTier.Pro:
			return __( 'Pro' );
		case TitanPlanTier.Premium:
			return __( 'Premium' );
		case TitanPlanTier.Ultra:
			return __( 'Ultra' );
	}
}

// The highest tier has nothing to upgrade to.
export function isHighestTitanTier( tier?: TitanPlanTier ): boolean {
	return !! tier && tier === TITAN_TIER_ORDER[ TITAN_TIER_ORDER.length - 1 ];
}

// A downgrade is a move to a strictly cheaper tier.
export function isLowerTitanTier( tier: TitanPlanTier, currentTier?: TitanPlanTier ): boolean {
	if ( ! currentTier ) {
		return false;
	}

	return TITAN_TIER_ORDER.indexOf( tier ) < TITAN_TIER_ORDER.indexOf( currentTier );
}

/**
 * Store product id to downgrade to, or undefined when the tier is not a valid
 * target.
 *
 * `downgrade_paths` is the authoritative list, but no products endpoint returns
 * it today, so the fallback mirrors the server rule: any strictly lower tier at
 * the same billing term. The server validates every downgrade anyway, so a
 * wrong target here fails as a bad request rather than charging incorrectly.
 *
 * When `downgrade_paths` is present it is used on its own, so this switches to
 * server data if the field is ever exposed.
 */
export function getTitanDowngradeTargetId( {
	currentTier,
	currentProduct,
	targetTier,
	targetProduct,
	interval,
}: {
	currentTier?: TitanPlanTier;
	currentProduct?: Product;
	targetTier: TitanPlanTier;
	// The target tier's product at the current interval, which keeps the
	// resolved id on the same billing term.
	targetProduct?: Product;
	interval: IntervalLength;
} ): number | undefined {
	if ( ! isLowerTitanTier( targetTier, currentTier ) ) {
		return undefined;
	}

	const targetSlug = TITAN_TIER_SLUGS[ targetTier ]?.[ interval ];
	if ( ! targetSlug ) {
		return undefined;
	}

	if ( currentProduct?.downgrade_paths ) {
		return currentProduct.downgrade_paths.find( ( path ) => path.product_slug === targetSlug )
			?.product_id;
	}

	// Ignore a product loaded for another tier or billing term.
	return targetProduct?.product_slug === targetSlug ? targetProduct.product_id : undefined;
}

export function getTitanTierFromSlug( productSlug?: string ): TitanPlanTier | undefined {
	if ( ! productSlug ) {
		return undefined;
	}

	return Object.values( TitanPlanTier ).find( ( tier ) =>
		Object.values( TITAN_TIER_SLUGS[ tier ] ).includes( productSlug )
	);
}
