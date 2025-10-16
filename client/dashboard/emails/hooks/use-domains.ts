import { SiteDomain } from '@automattic/api-core';
import { siteDomainsQuery, sitesQuery } from '@automattic/api-queries';
import { useQueries, useQuery } from '@tanstack/react-query';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';

export const useDomains = (): { domains: SiteDomain[]; isLoading: boolean } => {
	const { data: allSites, isLoading: isLoadingSites } = useQuery( sitesQuery() );
	const sites = ( allSites ?? [] )
		.filter( ( site ) => {
			const product = site?.plan?.product_slug ?? null;
			if ( product === null ) {
				return true;
			}
			return ! isSelfHostedJetpackConnected( site );
		} )
		.filter( ( site ) => site.capabilities.manage_options );
	const siteIds = sites.map( ( site ) => site.ID );

	// Fetch site domains for each managed site ID
	const domainsQueries = useQueries( {
		queries: siteIds.map( ( id ) => ( {
			...siteDomainsQuery( id ),
			enabled: Boolean( id ),
		} ) ),
	} );

	// Aggregate all domains into a single array
	const domains = domainsQueries.flatMap( ( q ) => ( q.data as SiteDomain[] ) ?? [] );

	return {
		domains,
		isLoading: isLoadingSites || domainsQueries.some( ( q ) => q.isLoading ),
	};
};
