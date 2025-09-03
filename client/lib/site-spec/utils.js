import config from '@automattic/calypso-config';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:site-spec:utils' );

export function isSiteSpecEnabled() {
	const enabled = config.isEnabled( 'site-spec-script' );
	debug( 'isSiteSpecEnabled:', enabled );
	return enabled;
}

/**
 * Get the cache-busted URL for the site spec script.
 */
export function getSiteSpecUrl() {
	debug( '🔍 getSiteSpecUrl called' );
	const url = config( 'site_spec_url' );
	debug( '🔍 site_spec_url config value:', url );
	if ( ! url ) {
		debug( '❌ SiteSpec URL not configured' );
		return null;
	}
	debug( '✅ SiteSpec URL found:', url );
	return url;
}

/**
 * Get the site spec configuration object.
 */
export function getSiteSpecConfig() {
	const configObj = {
		agentUrl: config( 'site_spec_agent_url' ),
		agentId: config( 'site_spec_agent_id' ),
		buildSiteUrl: config( 'site_spec_build_site_url' ),
	};

	debug( 'getSiteSpecConfig:', configObj );
	return configObj;
}
