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

	const otherEnvironmentSite = site.is_wpcom_staging_site ? productionSite : stagingSite;
	if ( otherEnvironmentSite ) {
		return canManageSite( otherEnvironmentSite );
	}

	return canCreateStagingSite( site );
}
