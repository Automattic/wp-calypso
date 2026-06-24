import { siteByIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { getProductionSiteId, getStagingSiteId } from '../../utils/site-staging-site';
import { canCreateStagingSite, canManageSite, canSwitchEnvironment } from '../features';
import type { Site } from '@automattic/api-core';

export default function useCanSwitchEnvironment( site?: Site ) {
	const productionSiteId = site ? getProductionSiteId( site ) : undefined;
	const { data: productionSite } = useQuery( {
		...siteByIdQuery( productionSiteId ?? 0 ),
		enabled: !! productionSiteId,
	} );

	const stagingSiteReference = productionSite ?? site;
	const stagingSiteId = stagingSiteReference ? getStagingSiteId( stagingSiteReference ) : undefined;
	const { data: stagingSite } = useQuery( {
		...siteByIdQuery( stagingSiteId ?? 0 ),
		enabled: !! stagingSiteId,
	} );

	if ( ! site || ! canSwitchEnvironment( site ) ) {
		return false;
	}

	// Match V1: only show the switcher to users who can manage the other
	// environment. When no other environment exists yet, fall back to whether
	// they can create one so the "Add staging site" affordance is preserved.
	const otherEnvironmentSite = site.is_wpcom_staging_site ? productionSite : stagingSite;

	return (
		( !! otherEnvironmentSite && canManageSite( otherEnvironmentSite ) ) ||
		canCreateStagingSite( site )
	);
}
