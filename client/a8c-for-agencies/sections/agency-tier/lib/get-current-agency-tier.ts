import { ALL_TIERS } from '../overview-content/constants';
import type { AgencyTierType } from '../overview-content/types';

export default function getCurrentAgencyTier( agencyTier?: AgencyTierType ) {
	return ALL_TIERS.find( ( tier ) => tier.id === agencyTier || tier.level === 0 );
}
