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
			const sitePromise = fetchSite( siteId );
			const mediaStoragePromise = fetchSiteMediaStorage( siteId );
			const currentPlanPromise = fetchCurrentPlan( siteId );
			const primaryDomainPromise = fetchSitePrimaryDomain( siteId );
			const engagementStatsPromise = fetchSiteEngagementStats( siteId );
			const siteMonitorUptimePromise = sitePromise.then( ( site ) =>
				site.jetpack && site.jetpack_modules.includes( 'monitor' )
					? fetchSiteMonitorUptime( siteId )
					: undefined
			);
			const phpVersionPromise = sitePromise.then( ( site ) =>
				site.options.is_wpcom_atomic ? fetchPHPVersion( siteId ) : undefined
			);

			const [
				site,
				mediaStorage,
				currentPlan,
				primaryDomain,
				engagementStats,
				siteMonitorUptime,
				phpVersion,
			] = await Promise.all( [
				sitePromise,
				mediaStoragePromise,
				currentPlanPromise,
				primaryDomainPromise,
				engagementStatsPromise,
				siteMonitorUptimePromise,
				phpVersionPromise,
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
