import config from '@automattic/calypso-config';

// Raw config structure from the server
interface SiteSpecRawConfig {
	agent_url?: string;
	agent_id?: string;
	build_site_url?: string;
	url: string;
	css_url: string;
}

// Config structure for the client
interface SiteSpecConfig {
	agentUrl?: string;
	agentId?: string;
	buildSiteUrl?: string;
}

// Config key for URL functions
type UrlKey = 'url' | 'css_url';

export function isSiteSpecEnabled(): boolean {
	return config.isEnabled( 'site-spec' );
}

/**
 * Get the cache-busted URL for the site spec script or CSS.
 * @param urlKey - The key to get from site spec config ('url' or 'css_url')
 * @returns The URL or null if not found
 */
export function getSiteSpecUrl( urlKey: UrlKey = 'url' ): string | null {
	const siteSpecConfig = config( 'site_spec' ) as SiteSpecRawConfig | undefined;
	const url = siteSpecConfig?.[ urlKey ];

	return url || null;
}

/**
 * Get the site spec configuration object.
 * Only includes properties that are defined in the config.
 */
export function getSiteSpecConfig(): SiteSpecConfig {
	const siteSpecConfig = config( 'site_spec' ) as SiteSpecRawConfig | undefined;

	if ( ! siteSpecConfig ) {
		return {};
	}

	return {
		agentUrl: siteSpecConfig?.agent_url,
		agentId: siteSpecConfig?.agent_id,
		buildSiteUrl: siteSpecConfig?.build_site_url,
	};
}
