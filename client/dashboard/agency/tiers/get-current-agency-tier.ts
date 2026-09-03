import { ALL_TIERS } from './constants';
import type { AgencyTierType } from './types';

export default function getCurrentAgencyTier( agencyTier?: AgencyTierType ) {
	return ALL_TIERS.find( ( tier ) => ( agencyTier ? tier.id === agencyTier : tier.level === 0 ) );
}
