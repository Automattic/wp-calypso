import config from '@automattic/calypso-config';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:site-spec:utils' );

export function isSiteSpecEnabled() {
	const enabled = config.isEnabled( 'site-spec' );
	debug( 'isSiteSpecEnabled:', enabled );
	return enabled;
}

/**
 * Get the cache-busted URL for the site spec script.
 */
export function getSiteSpecUrl() {
	debug( '🔍 getSiteSpecUrl called' );
	const siteSpecConfig = config( 'site_spec' );
	const url = siteSpecConfig?.url;
	debug( '🔍 site_spec config value:', siteSpecConfig );
	if ( ! url ) {
		debug( '❌ SiteSpec URL not configured' );
		return null;
	}
	debug( '✅ SiteSpec URL found:', url );
	return url;
}

/**
 * Get the cache-busted URL for the site spec CSS.
 */
export function getSiteSpecCssUrl() {
	debug( '🔍 getSiteSpecCssUrl called' );
	const siteSpecConfig = config( 'site_spec' );
	const url = siteSpecConfig?.css_url;
	debug( '🔍 site_spec config value:', siteSpecConfig );
	if ( ! url ) {
		debug( '❌ SiteSpec CSS URL not configured' );
		return null;
	}
	debug( '✅ SiteSpec CSS URL found:', url );
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

	debug( 'getSiteSpecConfig:', configObj );
	return configObj;
}
