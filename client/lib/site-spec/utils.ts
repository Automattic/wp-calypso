import config from '@automattic/calypso-config';

// Raw config structure from the server
interface SiteSpecRawConfig {
	agent_url?: string;
	agent_id?: string;
	build_site_url?: string;
	script_url: string;
	css_url: string;
}

// Config structure for the client
export interface SiteSpecConfig {
	agentUrl?: string;
	agentId?: string;
	buildSiteUrl?: string;
	tracking?: {
		enabled?: boolean;
		prefix?: string;
		getOverrides?: ( eventName: string ) => Record< string, string >;
	};
}

// Config key for URL functions
type UrlKey = 'script_url' | 'css_url';

// Resource type mapping
export type ResourceType = 'script' | 'css';

/**
 * Checks if the SiteSpec feature is enabled in the current environment.
 * @returns True if SiteSpec is enabled, false otherwise
 */
export function isSiteSpecEnabled(): boolean {
	return config.isEnabled( 'site-spec' );
}

/**
 * Retrieves the cache-busted URL for a specific SiteSpec resource.
 * @param urlKey - The configuration key for the resource type ({@link UrlKey}, default: 'script_url')
 * @returns The complete URL with cache-busting parameters, or null if not configured
 */
export function getSiteSpecUrl( urlKey: UrlKey = 'script_url' ): string | null {
	const siteSpecConfig = config( 'site_spec' ) as SiteSpecRawConfig | undefined;
	const url = siteSpecConfig?.[ urlKey ];

	return url?.trim() ?? null;
}

/**
 * Retrieves the cache-busted URL for a SiteSpec resource using the resource type.
 * @param type - The type of resource to retrieve ({@link ResourceType})
 * @returns The complete URL with cache-busting parameters, or null if not configured
 */
export function getSiteSpecUrlByType( type: ResourceType ): string | null {
	const urlKey = type === 'script' ? 'script_url' : 'css_url';
	return getSiteSpecUrl( urlKey );
}

/**
 * Retrieves the SiteSpec configuration object for initializing the widget.
 * @returns {SiteSpecConfig} Configuration object containing agent settings and build URLs
 */
export function getDefaultSiteSpecConfig(): SiteSpecConfig {
	const siteSpecConfig = config( 'site_spec' ) as SiteSpecRawConfig | undefined;

	if ( ! siteSpecConfig ) {
		return {};
	}

	return {
		agentUrl: siteSpecConfig?.agent_url,
		agentId: siteSpecConfig?.agent_id,
		buildSiteUrl: siteSpecConfig?.build_site_url,
		tracking: {
			enabled: true,
			prefix: 'jetpack_calypso',
			getOverrides: () => ( {
				client: 'calypso',
			} ),
		},
	};
}
