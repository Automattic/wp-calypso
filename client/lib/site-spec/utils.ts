import config from '@automattic/calypso-config';
import { WooLogo } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import { createElement, type ReactElement } from 'react';
import { buildCiabDashboardLink } from 'calypso/dashboard/app-ciab/routing';

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

// Config structure for the client
export interface SiteSpecConfig {
	agentUrl?: string;
	agentId?: string;
	buildSiteUrl?: string;
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
	tosConfig?: ToSConfig;
	placeholder?: string | string[];
	tracking?: {
		enabled: boolean;
		prefix: string;
		getOverrides?: ( event: string ) => Record< string, any >;
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
 * Retrieves the CIAB-specific SiteSpec configuration.
 * @returns {SiteSpecConfig} Configuration object for CIAB (Commerce in a Box) flow
 */
export function getCiabSiteSpecConfig(): SiteSpecConfig {
	// Check for 'referrer' parameter
	const ref = new URLSearchParams( window.location.search ).get( 'ref' );

	return {
		buildSiteUrl: '/setup/ai-site-builder/?create_garden_site=1&spec_id=',
		backButton: {
			enabled: ref === 'new-site-popover',
			url: buildCiabDashboardLink( '/sites' ),
		},
		exitButton: {
			enabled: false,
		},
		theme: {
			brandId: 'ciab',
			brandIcon: null,
			initialIcon: createElement( WooLogo, { width: 148, height: 38 } ),
			brandIconHeight: 32,
			brandColor: 'rgba(56, 88, 233, 1)',
			onboardingTitle: __( 'Your success story starts here.', 'site-spec' ),
			onboardingSubtitle: __(
				'Describe what you want to sell or offer, and the kind of store you want to create. We’ll use this to design your store — whether you take bookings, sell products, or both.',
				'site-spec'
			),
			colors: {
				background: '#F0F0F0',
				primary: 'rgba(56, 88, 233, 1)',
				primaryForeground: '#FFFFFF',
				foreground: '#1F1F1F',
				border: 'rgba(56, 88, 233, 1)',
				muted: '#E3E3E3',
				mutedForeground: '#717171',
			},
			promptSuggestions: {
				variant: 'solid',
				background: 'none',
				border: 'rgba(0, 0, 0, 0.1)',
				text: '#000000',
				hoverBackground: 'rgba(255,255,255,0.8)',
				hoverBorder: 'rgba(0, 0, 0, 0.1)',
				hoverOpacity: 0.85,
				enabled: true,
				items: [
					{
						label: __( 'Take bookings for a hair salon' ),
						prompt: __(
							"Create a trendy, fashion-forward hair salon website with a sleek, modern, polished aesthetic. Use black, cool gray, white, and accents of electric blue, emerald, or magenta. Apply stylish, confident copy and elegant sans-serif fonts like Bonita. Highlight the salon's unique skills and ensure the design feels vibrant and engaging.",
							'site-spec'
						),
					},
					{
						label: __( 'Offer personal training sessions' ),
						prompt: __(
							'Create a high-intensity fitness instructor website with an energetic, bold, dynamic aesthetic using black, deep red, electric orange, and charcoal gray. Use urgent, inspiring, direct copy and powerful sport-style sans-serif fonts like Jumpshot. Design the site to motivate users to book a training session.',
							'site-spec'
						),
					},
					{
						label: __( 'Create an online plant shop' ),
						prompt: __(
							'Create an eco-friendly plant store website with a natural, earthy, calming aesthetic using forest green, moss, terra cotta, warm beige, and natural white. Use nurturing, organic copy and fonts like Mollani Nature Script or Plantae. Showcase the full breadth of products with a fresh, inviting design.',
							'site-spec'
						),
					},
					{
						label: __( 'Host cooking workshops' ),
						prompt: __(
							'Create a fun, family-friendly cooking workshop website with a warm, inviting, colorful, playful aesthetic. Use bright yellow, orange, tomato red, warm brown, and cream tones. Apply warm, appetizing copy and friendly, whimsical fonts like Pacifico or Amatic SC. Design the site to encourage users to book a workshop.',
							'site-spec'
						),
					},
					{
						label: __( 'Sell handmade jewelry' ),
						prompt: __(
							'Create a handmade, one-of-a-kind jewelry store website with a rustic, intricate, elegant aesthetic. Use deep browns, terracotta, moss green, metallic gold or silver, and soft neutrals. Apply personal, inviting copy and refined script or serif fonts like Parisienne or Cormorant Garamond. Design the site to encourage users to buy online.',
							'site-spec'
						),
					},
					{
						label: __( 'Rent out photography equipment' ),
						prompt: __(
							'Create a high-tech, modern photography equipment rental website with a sleek, minimalist, futuristic aesthetic. Use charcoal gray, black, white, cool blue, and electric yellow/green accents. Apply informative, precise copy and clean, technical fonts like Kyrial Sans Pro or Zyphor. Design the site to encourage users to rent equipment.',
							'site-spec'
						),
					},
				],
			},
			radius: {
				base: '14px',
				input: '14px',
			},
			effects: {
				glow: false,
			},
			typography: {
				body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
				headings:
					'"Proxima Vara", "Proxima Nova", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
				headingWeight: 600,
			},
			poweredBy: {
				label: 'Powered by',
				logo: createElement( WooLogo, { width: 69, height: 18 } ),
				url: 'https://woocommerce.com',
				showOnOnboarding: false,
				opacity: 1,
			},
			buttons: {
				textColor: '#1F2933',
				hoverTextColor: 'rgba(56, 88, 233, 1)',
			},
			cssVariables: {
				'--spec-preview-create-bg': 'rgba(56, 88, 233, 1)',
				'--spec-preview-create-fg': '#FFFFFF',
				'--spec-preview-bg': '#FCFCFC',
				'--spec-preview-border': 'rgba(0, 0, 0, 0.1)',
				'--spec-preview-input-bg': '#FFFFFF',
				'--spec-preview-input-border': '1px solid #E0E0E0',
				'--spec-preview-checkbox-checked-bg': 'rgba(56, 88, 233, 1)',
				'--spec-preview-input-focus-border': 'rgba(0, 0, 0, 0.1)',
				'--spec-preview-checkbox-checked-border': 'rgba(56, 88, 233, 1)',
				// Spec preview submit button
				'--spec-preview-chip-fg': '#ffffff',
				'--spec-preview-chip-bg': 'rgba(56, 88, 233, 1)',
				'--spec-preview-checkbox-appearance': 'none',
			},
		},
		tosConfig: {
			showToS: true,
		},
	};
}
