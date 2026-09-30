import { wpcom } from '../wpcom-fetcher';
import type { SiteEngagementStatsResponse, SiteHourlyViewsResponse } from './types';

export async function fetchSiteEngagementStats(
	siteId: number
): Promise< SiteEngagementStatsResponse > {
	return wpcom.req.get( `/sites/${ siteId }/stats/visits`, {
		unit: 'day',
		quantity: 14,
		stat_fields: [ 'visitors', 'views', 'likes', 'comments' ].join( ',' ),
	} );
}

export async function fetchSiteEngagementMonthlyStats(
	siteId: number
): Promise< SiteEngagementStatsResponse > {
	return wpcom.req.get( `/sites/${ siteId }/stats/visits`, {
		unit: 'month',
		quantity: 24,
		stat_fields: [ 'visitors', 'views', 'likes', 'comments' ].join( ',' ),
	} );
}

export async function fetchSiteHourlyViews( siteId: number ): Promise< SiteHourlyViewsResponse > {
	return wpcom.req.get( `/sites/${ siteId }/stats/visits`, {
		unit: 'hour',
		quantity: 48,
		stat_fields: 'views',
	} );
}

/**
 * Whether the site has the Premium Analytics ("Stats v2") dashboard switched on. `undefined` when
 * the site does not register the setting, as on a Jetpack too old to ship it.
 */
export async function fetchSitePremiumAnalyticsEnabled(
	siteId: number
): Promise< boolean | undefined > {
	const settings = await wpcom.req.get( {
		path: `/sites/${ siteId }/settings`,
		apiNamespace: 'wp/v2',
	} );
	return settings?.jetpack_premium_analytics_enabled;
}
