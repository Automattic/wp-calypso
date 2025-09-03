import config from '@automattic/calypso-config';

export function isSiteSpecEnabled() {
	return config.isEnabled( 'site-spec' );
}

/**
 * Get the cache-busted URL for the site spec script.
 */
export function getSiteSpecUrl() {
	const siteSpecConfig = config( 'site_spec' );
	const url = siteSpecConfig?.url;
	if ( ! url ) {
		return null;
	}
	return url;
}

/**
 * Get the cache-busted URL for the site spec CSS.
 */
export function getSiteSpecCssUrl() {
	const siteSpecConfig = config( 'site_spec' );
	const url = siteSpecConfig?.css_url;
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
