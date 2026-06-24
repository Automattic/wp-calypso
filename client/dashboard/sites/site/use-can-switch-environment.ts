import { siteByIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { getProductionSiteId, getStagingSiteId } from '../../utils/site-staging-site';
import { canCreateStagingSite, canManageSite, canSwitchEnvironment } from '../features';
import type { Site } from '@automattic/api-core';

export default function useCanSwitchEnvironment( site?: Site ) {
	const otherEnvironmentSiteId =
		site && ( site.is_wpcom_staging_site ? getProductionSiteId( site ) : getStagingSiteId( site ) );
	const { data: otherEnvironmentSite } = useQuery( {
		...siteByIdQuery( otherEnvironmentSiteId ?? 0 ),
		enabled: !! otherEnvironmentSiteId,
	} );

	if ( ! site || ! canSwitchEnvironment( site ) ) {
		return false;
	}

	if ( otherEnvironmentSite ) {
		return canManageSite( otherEnvironmentSite );
	}

	return canCreateStagingSite( site );
}
