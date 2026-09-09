import { optionalConfig } from '../config-api';
import getOdysseyStatsBaseUrl from './get-odyssey-stats-base-url';

/**
 * The site's wp-admin URL, read from the config rather than from the site record's
 * `options.admin_url`: a site with no WordPress.com connection has no site record.
 *
 * Resolving it from the Stats page's own address is the fallback for CDN skew — this bundle ships
 * from a CDN and can meet a `stats-admin` old enough not to serve the key yet.
 */
const getWpAdminUrl = (): string => {
	const adminUrl = optionalConfig( 'admin_url' );

	if ( adminUrl ) {
		return adminUrl;
	}

	const statsUrl = getOdysseyStatsBaseUrl();

	return statsUrl ? new URL( './', statsUrl ).href : '';
};

export default getWpAdminUrl;
