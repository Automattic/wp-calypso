import { siteByIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { getProductionSiteId, getStagingSiteId } from '../../utils/site-staging-site';
import { canManageSite } from '../features';
import type { Site } from '@automattic/api-core';

export default function useCanManageOtherEnvironment( site: Site ) {
	const otherEnvironmentSiteId = site.is_wpcom_staging_site
		? getProductionSiteId( site )
		: getStagingSiteId( site );
	const { data: otherEnvironmentSite } = useQuery( {
		...siteByIdQuery( otherEnvironmentSiteId ?? 0 ),
		enabled: !! otherEnvironmentSiteId,
	} );

	return !! otherEnvironmentSite && canManageSite( otherEnvironmentSite );
}
