/**
 * MCP Tools Category Mapping
 *
 * Maps tool IDs and API categories to display categories for the MCP settings page.
 */

import { __ } from '@wordpress/i18n';

export const DISPLAY_CATEGORIES = {
	POSTS: __( 'Posts', 'calypso' ),
	PAGES: __( 'Pages', 'calypso' ),
	MEDIA: __( 'Media', 'calypso' ),
	COMMENTS: __( 'Comments', 'calypso' ),
	CATEGORIES_TAGS: __( 'Categories & tags', 'calypso' ),
	DESIGN: __( 'Design', 'calypso' ),
	SITES: __( 'Sites', 'calypso' ),
	USERS: __( 'Users', 'calypso' ),
	PLUGINS: __( 'Plugins', 'calypso' ),
	ANALYTICS: __( 'Analytics', 'calypso' ),
	SITE_SETTINGS: __( 'Site settings', 'calypso' ),
	ACCOUNT: __( 'Account', 'calypso' ),
	NOTIFICATIONS: __( 'Notifications', 'calypso' ),
	BILLING: __( 'Billing', 'calypso' ),
	DOMAINS: __( 'Domains', 'calypso' ),
	DEVELOPER_TESTING: __( 'Developer & testing', 'calypso' ),
	UNCATEGORIZED: __( 'Uncategorized', 'calypso' ),
} as const;

export const CATEGORY_ORDER = [
	DISPLAY_CATEGORIES.POSTS,
	DISPLAY_CATEGORIES.PAGES,
	DISPLAY_CATEGORIES.MEDIA,
	DISPLAY_CATEGORIES.COMMENTS,
	DISPLAY_CATEGORIES.CATEGORIES_TAGS,
	DISPLAY_CATEGORIES.DESIGN,
	DISPLAY_CATEGORIES.SITES,
	DISPLAY_CATEGORIES.USERS,
	DISPLAY_CATEGORIES.PLUGINS,
	DISPLAY_CATEGORIES.ANALYTICS,
	DISPLAY_CATEGORIES.SITE_SETTINGS,
	DISPLAY_CATEGORIES.ACCOUNT,
	DISPLAY_CATEGORIES.NOTIFICATIONS,
	DISPLAY_CATEGORIES.BILLING,
	DISPLAY_CATEGORIES.DOMAINS,
	DISPLAY_CATEGORIES.DEVELOPER_TESTING,
	DISPLAY_CATEGORIES.UNCATEGORIZED,
] as const;

/** Maps API category values to display category names (fallback when tool not in explicit map) */
export const API_CATEGORY_TO_DISPLAY: Record< string, string > = {
	user: DISPLAY_CATEGORIES.ACCOUNT,
	content: DISPLAY_CATEGORIES.UNCATEGORIZED,
	site: DISPLAY_CATEGORIES.SITE_SETTINGS,
	analytics: DISPLAY_CATEGORIES.ANALYTICS,
	internal: DISPLAY_CATEGORIES.DEVELOPER_TESTING,
	utility: DISPLAY_CATEGORIES.DEVELOPER_TESTING,
};

/**
 * Tools that need an explicit display category (single-tool groups or cross-prefix exceptions).
 */
const TOOL_DISPLAY_OVERRIDES: Record< string, string > = {
	// Sites
	'user-sites': DISPLAY_CATEGORIES.SITES,
	'user-sites-resource': DISPLAY_CATEGORIES.SITES,
	// Users
	'site-users': DISPLAY_CATEGORIES.USERS,
	// Plugins
	'site-plugins': DISPLAY_CATEGORIES.PLUGINS,
	// Analytics
	'site-statistics': DISPLAY_CATEGORIES.ANALYTICS,
	'site-activity-log': DISPLAY_CATEGORIES.ANALYTICS,
	// Site Settings
	'site-settings': DISPLAY_CATEGORIES.SITE_SETTINGS,
	// Account
	'user-profile': DISPLAY_CATEGORIES.ACCOUNT,
	'user-achievements': DISPLAY_CATEGORIES.ACCOUNT,
	'user-security': DISPLAY_CATEGORIES.ACCOUNT,
	// Notifications
	'user-notifications': DISPLAY_CATEGORIES.NOTIFICATIONS,
	'user-notifications-inbox': DISPLAY_CATEGORIES.NOTIFICATIONS,
	// Billing
	'user-subscriptions': DISPLAY_CATEGORIES.BILLING,
	// Domains
	'user-domains': DISPLAY_CATEGORIES.DOMAINS,
	'domain-purchase': DISPLAY_CATEGORIES.DOMAINS,
	'user-connections': DISPLAY_CATEGORIES.DOMAINS,
};

/**
 * Prefix-based overrides, checked after exact match. Order matters — more specific prefixes
 * (e.g. 'site-posts-') must come before less specific ones (e.g. 'site-').
 */
const TOOL_PREFIX_OVERRIDES: Array< [ string, string ] > = [
	[ 'posts-', DISPLAY_CATEGORIES.POSTS ],
	[ 'post-', DISPLAY_CATEGORIES.POSTS ], // legacy: post-get
	[ 'site-posts-', DISPLAY_CATEGORIES.POSTS ], // site-level server tools
	[ 'site-post-', DISPLAY_CATEGORIES.POSTS ], // site-level server tools
	[ 'pages-', DISPLAY_CATEGORIES.PAGES ],
	[ 'media-', DISPLAY_CATEGORIES.MEDIA ],
	[ 'comments-', DISPLAY_CATEGORIES.COMMENTS ],
	[ 'site-comments-', DISPLAY_CATEGORIES.COMMENTS ],
	[ 'categories-', DISPLAY_CATEGORIES.CATEGORIES_TAGS ],
	[ 'tags-', DISPLAY_CATEGORIES.CATEGORIES_TAGS ],
	[ 'synced-patterns-', DISPLAY_CATEGORIES.DESIGN ],
	[ 'patterns-', DISPLAY_CATEGORIES.DESIGN ],
	[ 'theme-', DISPLAY_CATEGORIES.DESIGN ],
	[ 'blocks-', DISPLAY_CATEGORIES.DESIGN ],
];

/**
 * Returns true if a tool should be treated as a write operation.
 * Uses the `readonly` field from the API: a tool is a write tool when readonly is explicitly false.
 * @param toolId - The tool ID (e.g., 'wpcom-mcp/create-post')
 * @param ability - Optional ability object with readonly flag from API
 * @param ability.readonly - Whether the tool is read-only
 * @returns Whether the tool is a write operation
 */
export function isWriteTool( toolId: string, ability?: { readonly?: boolean } ): boolean {
	return ability?.readonly === false;
}

/**
 * Get the display category for a tool based on its ID and optional API category.
 * @param toolId - The tool ID (e.g., 'wpcom-mcp/user-profile')
 * @param ability - Optional ability object with category from API
 * @param ability.category - API category (user, content, site, analytics, internal, utility)
 * @returns The display category name
 */
export function getDisplayCategory( toolId: string, ability?: { category?: string } ): string {
	const toolName = toolId.replace( 'wpcom-mcp/', '' );

	// 1. Exact match overrides
	const exactOverride = TOOL_DISPLAY_OVERRIDES[ toolName ];
	if ( exactOverride ) {
		return exactOverride;
	}

	// 2. Prefix-based overrides
	for ( const [ prefix, category ] of TOOL_PREFIX_OVERRIDES ) {
		if ( toolName.startsWith( prefix ) ) {
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
