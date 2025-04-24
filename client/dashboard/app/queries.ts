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
	updateProfile,
} from '../data';
import { queryClient } from './query-client';
import type { Profile } from '../data/types';

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
			const site = await fetchSite( siteId );
			const [
				mediaStorage,
				siteMonitorUptime,
				phpVersion,
				currentPlan,
				primaryDomain,
				engagementStats,
			] = await Promise.all( [
				fetchSiteMediaStorage( siteId ),
				fetchSiteMonitorUptime( site ),
				fetchPHPVersion( site ),
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

const profileQueryKey = [ 'profile' ];

export function profileQuery() {
	return {
		queryKey: profileQueryKey,
		queryFn: fetchProfile,
	};
}

export function profileMutation() {
	return {
		mutationFn: updateProfile,
		onSuccess: ( newData: Partial< Profile > ) => {
			queryClient.setQueryData( profileQueryKey, ( oldData: Profile | undefined ) =>
				oldData ? { ...oldData, ...newData } : newData
			);
		},
	};
}
