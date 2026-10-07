import { wpcom } from '../wpcom-fetcher';
import type { SitePremiumAnalyticsSettings, SiteSettings } from './types';

export async function fetchSiteSettings( siteId: number ): Promise< SiteSettings > {
	const { settings } = await wpcom.req.get( {
		path: `/sites/${ siteId }/settings`,
		apiVersion: '1.4',
	} );
	return {
		...settings,
		gmt_offset: Number( settings.gmt_offset ) || 0,
	};
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
