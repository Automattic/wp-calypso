import { HostingFeatures } from '@automattic/api-core';
import {
	queryClient,
	siteDataCenterQuery,
	sitePrimaryDataCenterQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { hasHostingFeature } from '../../utils/site-features';
import type { DataCenterOption, Site } from '@automattic/api-core';

// The data-center endpoint knows where a site runs. Where it isn't available, fall back to the
// primary data center, which is only set when someone chose one.

export async function ensureHostedDataCenter( site: Site ): Promise< DataCenterOption | null > {
	if ( ! hasHostingFeature( site, HostingFeatures.PRIMARY_DATA_CENTER ) ) {
		return null;
	}
	const dataCenter = await queryClient
		.ensureQueryData( siteDataCenterQuery( site.ID ) )
		.catch( () => null );
	if ( dataCenter?.current ) {
		return dataCenter.current;
	}
	return queryClient.ensureQueryData( sitePrimaryDataCenterQuery( site.ID ) );
}

export function useHostedDataCenter( site: Site ) {
	const enabled = hasHostingFeature( site, HostingFeatures.PRIMARY_DATA_CENTER );
	const { data: dataCenter } = useQuery( { ...siteDataCenterQuery( site.ID ), enabled } );
	const { data: primaryDataCenter } = useQuery( {
		...sitePrimaryDataCenterQuery( site.ID ),
		enabled,
	} );
	return {
		current: dataCenter?.current ?? primaryDataCenter ?? null,
		recommended: dataCenter?.recommended ?? null,
		available: dataCenter?.available ?? [],
	};
}
