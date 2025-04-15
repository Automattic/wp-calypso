import {
	fetchSites,
	fetchSite,
	fetchSiteMediaStorage,
	fetchSiteMonitorUptime,
	fetchPHPVersion,
	fetchCurrentPlan,
	fetchSitePrimaryDomain,
	fetchSiteEngagementStats,
	fetchDomains,
	fetchEmails,
	fetchProfile,
} from '../data';

export function sitesQuery() {
	return {
		queryKey: [ 'sites' ],
		queryFn: fetchSites,
	};
}

export function siteQuery( siteId: string ) {
	return {
		queryKey: [ 'site', siteId ],
		queryFn: async () => {
			const [
				site,
				mediaStorage,
				siteMonitorUptime,
				phpVersion,
				currentPlan,
				primaryDomain,
				engagementStats,
			] = await Promise.all( [
				fetchSite( siteId ),
				fetchSiteMediaStorage( siteId ),
				fetchSiteMonitorUptime( siteId ),
				fetchPHPVersion( siteId ),
				fetchCurrentPlan( siteId ),
				fetchSitePrimaryDomain( siteId ),
				fetchSiteEngagementStats( siteId ),
			] );
			return {
				site,
				mediaStorage,
				siteMonitorUptime,
				phpVersion,
				currentPlan,
				primaryDomain,
				engagementStats,
			};
		},
	};
}

export function domainsQuery() {
	return {
		queryKey: [ 'domains' ],
		queryFn: fetchDomains,
	};
}

export function emailsQuery() {
	return {
		queryKey: [ 'emails' ],
		queryFn: fetchEmails,
	};
}

export function profileQuery() {
	return {
		queryKey: [ 'profile' ],
		queryFn: fetchProfile,
	};
}
