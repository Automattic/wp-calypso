/**
 * MCP Tools Category Mapping
 *
 * Maps tool IDs and API categories to display categories for the MCP settings page.
 */

import { __ } from '@wordpress/i18n';

export const DISPLAY_CATEGORIES = {
	SITES: __( 'Sites', 'calypso' ),
	POSTS: __( 'Posts', 'calypso' ),
	PAGES: __( 'Pages', 'calypso' ),
	MEDIA: __( 'Media', 'calypso' ),
	DESIGN: __( 'Design', 'calypso' ),
	CONTENT: __( 'Content', 'calypso' ),
	ACCOUNT: __( 'Account', 'calypso' ),
	BILLING: __( 'Billing', 'calypso' ),
	NOTIFICATIONS: __( 'Notifications', 'calypso' ),
	DOMAINS_INTEGRATIONS: __( 'Domains & Integrations', 'calypso' ),
	SITE_CONFIGURATION: __( 'Site Configuration', 'calypso' ),
	DEVELOPER_TESTING: __( 'Developer & Testing', 'calypso' ),
	UNCATEGORIZED: __( 'Uncategorized', 'calypso' ),
} as const;

export const CATEGORY_ORDER = [
	DISPLAY_CATEGORIES.SITES,
	DISPLAY_CATEGORIES.POSTS,
	DISPLAY_CATEGORIES.PAGES,
	DISPLAY_CATEGORIES.MEDIA,
	DISPLAY_CATEGORIES.DESIGN,
	DISPLAY_CATEGORIES.CONTENT,
	DISPLAY_CATEGORIES.ACCOUNT,
	DISPLAY_CATEGORIES.BILLING,
	DISPLAY_CATEGORIES.NOTIFICATIONS,
	DISPLAY_CATEGORIES.DOMAINS_INTEGRATIONS,
	DISPLAY_CATEGORIES.SITE_CONFIGURATION,
	DISPLAY_CATEGORIES.DEVELOPER_TESTING,
	DISPLAY_CATEGORIES.UNCATEGORIZED,
] as const;

/** Maps API category values to display category names (fallback when tool not in explicit map) */
export const API_CATEGORY_TO_DISPLAY: Record< string, string > = {
	user: DISPLAY_CATEGORIES.ACCOUNT,
	content: DISPLAY_CATEGORIES.CONTENT,
	site: DISPLAY_CATEGORIES.SITE_CONFIGURATION,
	analytics: DISPLAY_CATEGORIES.SITE_CONFIGURATION,
	internal: DISPLAY_CATEGORIES.DEVELOPER_TESTING,
	utility: DISPLAY_CATEGORIES.DEVELOPER_TESTING,
};

/**
 * Keyword-based matching for content tools. When a tool ID contains one of these
 * keywords, it's assigned to the corresponding display category. This allows new
 * tools to auto-sort without needing explicit overrides for each one.
 *
 * Checked before the API category fallback, after explicit overrides.
 */
const CONTENT_KEYWORD_TO_DISPLAY: Array< [ string[], string ] > = [
	[ [ 'post', 'comment', 'tag', 'categor' ], DISPLAY_CATEGORIES.POSTS ],
	[ [ 'page' ], DISPLAY_CATEGORIES.PAGES ],
	[ [ 'media', 'image', 'upload', 'attachment' ], DISPLAY_CATEGORIES.MEDIA ],
	[ [ 'pattern', 'block', 'theme', 'template', 'style' ], DISPLAY_CATEGORIES.DESIGN ],
];

/**
 * Tools that need a different display category than their API category (e.g. "user" tools
 * that belong in Sites, Billing, Notifications, or Domains & Integrations).
 */
const TOOL_DISPLAY_OVERRIDES: Record< string, string > = {
	'user-sites-resource': DISPLAY_CATEGORIES.SITES,
	'user-sites': DISPLAY_CATEGORIES.SITES,
	'site-users': DISPLAY_CATEGORIES.SITES,
	'site-plugins': DISPLAY_CATEGORIES.SITES,
	'user-domains': DISPLAY_CATEGORIES.DOMAINS_INTEGRATIONS,
	'user-connections': DISPLAY_CATEGORIES.DOMAINS_INTEGRATIONS,
	'user-subscriptions': DISPLAY_CATEGORIES.BILLING,
	'user-notifications': DISPLAY_CATEGORIES.NOTIFICATIONS,
	'user-notifications-inbox': DISPLAY_CATEGORIES.NOTIFICATIONS,
};

/**
 * Get the display category for a tool based on its ID and optional API category.
 *
 * Matching priority:
 * 1. Explicit overrides (TOOL_DISPLAY_OVERRIDES) — for known tool IDs
 * 2. Keyword matching (CONTENT_KEYWORD_TO_DISPLAY) — auto-sorts by tool name
 * 3. API category fallback (API_CATEGORY_TO_DISPLAY) — catch-all by server category
 *
 * @param toolId - The tool ID (e.g., 'wpcom-mcp/user-profile')
 * @param ability - Optional ability object with category from API
 * @param ability.category - API category (user, content, site, analytics, internal, utility)
 * @returns The display category name
 */
export function getDisplayCategory( toolId: string, ability?: { category?: string } ): string {
	const toolName = toolId.replace( 'wpcom-mcp/', '' );

	// 1. Check explicit overrides first (tools that need different grouping than API category)
	const override = TOOL_DISPLAY_OVERRIDES[ toolName ];
	if ( override ) {
		return override;
	}

	// 2. Keyword matching — auto-sorts content tools by name
	for ( const [ keywords, category ] of CONTENT_KEYWORD_TO_DISPLAY ) {
		if ( keywords.some( ( kw ) => toolName.includes( kw ) ) ) {
			return category;
		}
	}

	// 3. API category fallback
	const apiCategory = ability?.category;
	if ( apiCategory && API_CATEGORY_TO_DISPLAY[ apiCategory ] ) {
		return API_CATEGORY_TO_DISPLAY[ apiCategory ];
	}

	return DISPLAY_CATEGORIES.UNCATEGORIZED;
}

// ─── Permission-level grouping ──────────────────────────────────────────────

export const PERMISSION_LEVELS = {
	READ: {
		key: 'read' as const,
		label: __( 'Read' ),
		description: __( 'View your sites, posts, and account info.' ),
	},
	WRITE: {
		key: 'write' as const,
		label: __( 'Write' ),
		description: __( 'Create and edit posts, media, and settings.' ),
	},
	MANAGE: {
		key: 'manage' as const,
		label: __( 'Manage' ),
		description: __( 'Delete content, manage plugins, and billing.' ),
	},
} as const;

export type PermissionLevelKey =
	( typeof PERMISSION_LEVELS )[ keyof typeof PERMISSION_LEVELS ][ 'key' ];

export const PERMISSION_LEVEL_ORDER = [
	PERMISSION_LEVELS.READ,
	PERMISSION_LEVELS.WRITE,
	PERMISSION_LEVELS.MANAGE,
] as const;

/**
 * Classify a tool into a permission level based on its annotations.
 * - readonly → Read
 * - destructive → Manage
 * - everything else → Write
 */
export function getPermissionLevel( tool: {
	annotations?: { readonly?: boolean; destructive?: boolean };
} ): PermissionLevelKey {
	if ( tool.annotations?.readonly ) {
		return 'read';
	}
	if ( tool.annotations?.destructive ) {
		return 'manage';
	}
	return 'write';
}

/**
 * Look up a permission level config by its URL slug.
 */
export function getPermissionLevelBySlug( slug: string ) {
	return Object.values( PERMISSION_LEVELS ).find( ( level ) => level.key === slug );
}
