import {
	fetchSiteUrlAnalysis,
	fetchSiteHostingDiscovery,
	fetchSiteDnsDiscovery,
} from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

const discoveryOptions = {
	staleTime: 5 * 60 * 1000,
	retry: false,
	refetchOnWindowFocus: false,
	meta: { persist: false },
};

export const siteUrlAnalysisQuery = ( url: string ) =>
	queryOptions( {
		...discoveryOptions,
		queryKey: [ 'site-discovery', 'url', url ],
		queryFn: () => fetchSiteUrlAnalysis( url ),
	} );

export const siteHostingDiscoveryQuery = ( domain: string ) =>
	queryOptions( {
		...discoveryOptions,
		queryKey: [ 'site-discovery', 'hosting', domain ],
		queryFn: () => fetchSiteHostingDiscovery( domain ),
	} );

export const siteDnsDiscoveryQuery = ( domain: string ) =>
	queryOptions( {
		...discoveryOptions,
		queryKey: [ 'site-discovery', 'dns', domain ],
		queryFn: () => fetchSiteDnsDiscovery( domain ),
	} );
