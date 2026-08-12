import getOdysseyStatsBaseUrl from './get-odyssey-stats-base-url';

/**
 * The site's wp-admin URL, resolved from the Stats page's own address rather than from the site
 * record's `options.admin_url`: a site with no WordPress.com connection has no site record.
 */
const getWpAdminUrl = (): string => {
	const statsUrl = getOdysseyStatsBaseUrl();

	return statsUrl ? new URL( './', statsUrl ).href : '';
};

export default getWpAdminUrl;
