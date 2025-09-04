import config from '@automattic/calypso-config';

export function isSiteSpecEnabled() {
	return config.isEnabled( 'site-spec' );
}

/**
 * Get the cache-busted URL for the site spec script or CSS.
 * @param {string} urlKey - The key to get from site spec config ('url' or 'css_url')
 * @returns {string|null} The URL or null if not found
 */
export function getSiteSpecUrl( urlKey = 'url' ) {
	const siteSpecConfig = config( 'site_spec' );
	const url = siteSpecConfig?.[ urlKey ];
	if ( ! url ) {
		return null;
	}
	return url;
}

/**
 * Get the site spec configuration object.
 */
export function getSiteSpecConfig() {
	const siteSpecConfig = config( 'site_spec' );
	const configObj = {
		agentUrl: siteSpecConfig?.agent_url,
		agentId: siteSpecConfig?.agent_id,
		buildSiteUrl: siteSpecConfig?.build_site_url,
	};

	return configObj;
}
