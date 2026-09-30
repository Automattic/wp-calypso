import { wpcom } from '../wpcom-fetcher';
import type {
	SiteEngagementStatsResponse,
	SiteHourlyViewsResponse,
	SitePremiumAnalyticsSettings,
} from './types';

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
 * The site settings that say whether the Premium Analytics ("Stats v2") dashboard is switched on.
 */
export async function fetchSitePremiumAnalyticsSettings(
	siteId: number
): Promise< SitePremiumAnalyticsSettings > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/settings`,
		apiNamespace: 'wp/v2',
	} );
}
