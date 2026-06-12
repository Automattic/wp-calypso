import { TitanMailSlugs } from '@automattic/api-core';
import { IntervalLength, TitanPlanTier } from '../types';

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

export function isTitanPlanTier( value: unknown ): value is TitanPlanTier {
	return Object.values( TitanPlanTier ).includes( value as TitanPlanTier );
}

export function getTitanTierFromSlug( productSlug?: string ): TitanPlanTier | undefined {
	if ( ! productSlug ) {
		return undefined;
	}

	return Object.values( TitanPlanTier ).find( ( tier ) =>
		Object.values( TITAN_TIER_SLUGS[ tier ] ).includes( productSlug )
	);
}
