import { ALL_TIERS } from './constants';
import type { AgencyTierType } from './types';

export function isProPartnerOrHigher( agencyTier?: AgencyTierType ) {
	return (
		agencyTier === 'pro-agency-partner' ||
		agencyTier === 'vip-pro-agency-partner' ||
		agencyTier === 'premier-partner'
	);
}

export default function getCurrentAgencyTier( agencyTier?: AgencyTierType ) {
	return ALL_TIERS.find( ( tier ) => ( agencyTier ? tier.id === agencyTier : tier.level === 0 ) );
}
