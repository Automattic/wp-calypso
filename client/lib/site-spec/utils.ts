import config from '@automattic/calypso-config';
import { addQueryArgs } from '@wordpress/url';
import type { ReactElement } from 'react';

// Raw config structure from the server
interface SiteSpecRawConfig {
	agent_url?: string;
	agent_id?: string;
	build_site_url?: string;
	script_url: string;
	css_url: string;
}

export interface ToSConfig {
	userGuidelinesPrefix?: string;
	userGuidelinesText?: string;
	userGuidelinesUrl?: string;
	showToS?: boolean;
	contentHtml?: string;
}

export interface BackButtonConfig {
	url?: string;
	label?: string;
	enabled?: boolean;
	useHistory?: boolean;
}

export interface SiteSpecCollectedContext {
	instruction?: string;
	data?: Record< string, string >;
	meta?: Record< string, string >;
}

// Config structure for the client
export interface SiteSpecConfig {
	agentUrl?: string;
	agentId?: string;
	buildSiteUrl?: string;
	authProvider?: () => Promise< Record< string, string > >;
	// Blueprint identifier when building from a blueprint. Forwarded by the widget
	// to the agent (metadata.blueprint_id) so it can run a blueprint-aware interview.
	blueprintId?: string;
	// What the embedding page already knows about the user, handed to the widget on its first
	// turn: `instruction` and `data` go to the agent with the first message, `meta` is stamped
	// into the stored spec (allow-listed keys only, sanitised on the wpcom side). Runs once per
	// mount and must be free of side effects; returning null seeds nothing.
	collector?: () => SiteSpecCollectedContext | null | Promise< SiteSpecCollectedContext | null >;
	theme?: {
		// Branding
		brandIcon?: ReactElement | string | null; // ReactElement or image URL; null hides
		brandIconAlt?: string; // Alt text for brandIcon when string URL
		brandIconHeight?: number | string;
		initialIcon?: ReactElement | string | null; // ReactElement or image URL; null hides
		initialIconAlt?: string; // Alt text for initialIcon when string URL

		// Copy overrides
		onboardingTitle?: string; // e.g., "Make a website as unique as you."
		onboardingSubtitle?: string; // Optional subheader text under the title

		// Colors and shape tokens
		brandColor?: string; // Back-compat primary brand color
		colors?: {
			background?: string;
			primary?: string;
			primaryForeground?: string;
			foreground?: string;
			border?: string;
			muted?: string;
			mutedForeground?: string;
		};
		radius?: {
			base?: string; // e.g., '12px'
			input?: string; // e.g., '12px'
		};

		// Powered by
		poweredBy?: {
			label?: string; // e.g., 'Powered by'
			logo?: ReactElement | string; // React element or image URL
			logoAlt?: string; // Alt text for logo when string URL
			url?: string; // Click-through link
			position?: 'header' | 'footer';
			showOnOnboarding?: boolean;
			opacity?: number;
		};

		promptSuggestions?: {
			variant?: 'glass' | 'solid';
			background?: string;
			border?: string;
			text?: string;
			hoverOpacity?: number;
			hoverBackground?: string;
			hoverBorder?: string;
			hoverText?: string;
			enabled?: boolean;
			items?: Array< {
				label: string;
				prompt: string;
			} >;
		};

		buttons?: {
			textColor?: string;
			hoverTextColor?: string;
		};

		effects?: {
			glow?: boolean;
			glowColor?: string; // Optional color of the glow overlay
		};

		typography?: {
			body?: string;
			headings?: string;
			headingWeight?: number;
		};

		// Identification/metadata
		brandId?: string; // Analytics/diagnostics identifier
		version?: string; // Theme schema/version tag

		// Styling hooks
		className?: string; // Custom class on root container
		cssVariables?: Record< string, string >; // Arbitrary CSS custom props
	};
	features?: {
		// `true` shows the site brief dialog in place of the basic spec preview;
		// `'next'` also shows its socials/attachments sections.
		siteBrief?: boolean | 'next';
		// Which link types the brief offers. `'social'` (the widget's default)
		// is social networks only; `'all'` adds a website link, its preview
		// card and remove button. Sub-feature of `siteBrief: 'next'` — the
		// widget ignores it otherwise.
		links?: 'social' | 'all';
	};
	tosConfig?: ToSConfig;
	placeholder?: string | string[];
	tracking?: {
		enabled: boolean;
		prefix: string;
		getOverrides?: ( event: string ) => Record< string, unknown >;
	};
	backButton?: BackButtonConfig;
	exitButton?: {
		enabled?: boolean;
		color?: string;
		hoverColor?: string;
		label?: string;
		callback?: () => void;
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

/**
 * SiteSpec configuration for a site being built from a blueprint. Extends the
 * default config with the blueprint identifier so the widget forwards it to the
 * agent (as metadata.blueprint_id), which then runs a blueprint-aware interview.
 *
 * Confirms on the site brief rather than the basic spec preview, like the
 * build-wow flow: the brief is where the user edits the page set, goals and
 * social links the blueprint's apply step carries onto the imported site.
 *
 * `specMeta` is what the entry URL already told us (a Zoom booking page, say). It is handed to
 * the widget through a collector so it is stamped into the spec as `meta`, where the blueprint's
 * configuration pass reads it; it does not open the conversation, since meta alone gives the
 * agent nothing to say.
 * @param {Object} params            Params.
 * @param {string} params.blueprintId Blueprint identifier (numeric library id or slug).
 * @param {Object} params.specMeta    Spec meta from the entry URL, keyed by allow-listed name.
 * @returns {SiteSpecConfig} Configuration object for the blueprint flow.
 */
export function getBlueprintSiteSpecConfig( {
	blueprintId,
	specMeta,
}: {
	blueprintId?: string;
	specMeta?: Record< string, string >;
} ): SiteSpecConfig {
	const defaultConfig = getDefaultSiteSpecConfig();
	const meta = Object.fromEntries(
		Object.entries( specMeta ?? {} ).filter(
			( [ , value ] ) => typeof value === 'string' && value !== ''
		)
	);

	return {
		...defaultConfig,
		...( blueprintId ? { blueprintId } : {} ),
		...( Object.keys( meta ).length > 0 ? { collector: () => ( { meta } ) } : {} ),
		features: {
			...defaultConfig.features,
			siteBrief: 'next',
			// Social networks only, pinned for the same reason as build-wow.
			links: 'social',
		},
	};
}

/**
 * Retrieves the SiteSpec configuration for WPCOM Atomic site provisioning.
 *
 * The widget may either call `onSpecConfirm` or navigate to `buildSiteUrl`
 * with the spec id appended. Keep the navigation inside the Site Spec route so
 * Calypso can pass the confirmed spec to the regular AI site builder flow.
 * @returns {SiteSpecConfig} Configuration object for WPCOM Atomic site provisioning.
 */
export function getEarlyProvisionSiteSpecConfig(): SiteSpecConfig {
	return {
		...getDefaultSiteSpecConfig(),
		buildSiteUrl: '/setup/ai-site-builder-spec/site-spec?provision_target=wpcom-atomic&spec_id=',
	};
}

/**
 * Retrieves the SiteSpec configuration for post-checkout build-wow provisioning.
 *
 * The widget may either call `onSpecConfirm` or navigate to `buildSiteUrl`
 * with the spec id appended. Keep that navigation inside the Site Spec route
 * so Calypso can attach the confirmed spec to the existing post-checkout site.
 * @returns {SiteSpecConfig} Configuration object for build-wow provisioning.
 */
export function getBuildWowSiteSpecConfig( {
	siteSlug,
	siteId,
	ref,
	source,
	graph,
}: {
	siteSlug?: string | null;
	siteId?: string | number | null;
	ref?: string | null;
	source?: string | null;
	graph?: string | null;
} = {} ): SiteSpecConfig {
	const buildSiteUrl = addQueryArgs( '/setup/ai-site-builder-spec/site-spec', {
		build_wow: '1',
		...( siteSlug ? { siteSlug } : {} ),
		...( siteId && String( siteId ) !== '0' ? { siteId } : {} ),
		...( ref ? { ref } : {} ),
		...( source ? { source } : {} ),
		...( graph ? { graph } : {} ),
	} );

	const defaultConfig = getDefaultSiteSpecConfig();

	return {
		...defaultConfig,
		buildSiteUrl: `${ buildSiteUrl }${ buildSiteUrl.includes( '?' ) ? '&' : '?' }spec_id=`,
		features: {
			...defaultConfig.features,
			siteBrief: 'next',
			// Social networks only. `'social'` is the widget's default, but pin
			// it so this flow keeps offering social links and nothing else if
			// that default ever moves.
			links: 'social',
		},
	};
}
