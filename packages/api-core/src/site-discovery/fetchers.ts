import { wpcom } from '../wpcom-fetcher';
import type { SiteUrlAnalysis, SiteHostingDiscovery, SiteDnsDiscovery } from './types';

export async function fetchSiteUrlAnalysis( url: string ): Promise< SiteUrlAnalysis > {
	return wpcom.req.get(
		{ path: '/imports/analyze-url', apiNamespace: 'wpcom/v2' },
		{ site_url: url }
	);
}

export async function fetchSiteHostingDiscovery( domain: string ): Promise< SiteHostingDiscovery > {
	return wpcom.req.get( {
		path: `/site-profiler/hosting-provider/${ encodeURIComponent( domain ) }`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchSiteDnsDiscovery( domain: string ): Promise< SiteDnsDiscovery > {
	const result: SiteDnsDiscovery = await wpcom.req.get( {
		path: `/site-profiler/${ encodeURIComponent( domain ) }`,
		apiNamespace: 'wpcom/v2',
	} );
	// The endpoint also returns WHOIS contact details; the wizard only needs DNS.
	return { domain: result.domain, dns: result.dns ?? [] };
}
