import { useQuery } from '@tanstack/react-query';
import { useAppContext } from '../../../app/context';
import type { Site } from '@automattic/api-core';

export function useEligibleSites() {
	const { queries } = useAppContext();

	return useQuery( {
		...queries.sitesQuery(),
		select: ( sites: Site[] ) =>
			sites.filter( ( site ) => {
				const canUpdatePlugins = Boolean( site.capabilities?.update_plugins );
				const isAtomic = Boolean( site.is_wpcom_atomic );
				const isStaging = Boolean( site.is_wpcom_staging_site );
				return isAtomic && canUpdatePlugins && ! isStaging;
			} ),
	} );
}
