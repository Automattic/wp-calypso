/**
 * MCP Tools Category Mapping
 *
 * Maps tool IDs and API categories to display categories for the MCP settings page.
 */

import { __ } from '@wordpress/i18n';

export const DISPLAY_CATEGORIES = {
	POSTS: __( 'Posts', 'calypso' ),
	PAGES: __( 'Pages', 'calypso' ),
	DESIGN: __( 'Design', 'calypso' ),
	SITES: __( 'Sites', 'calypso' ),
	ACCOUNT: __( 'Account', 'calypso' ),
	DOMAINS: __( 'Domains', 'calypso' ),
	DEVELOPER_TESTING: __( 'Developer & testing', 'calypso' ),
	UNCATEGORIZED: __( 'Uncategorized', 'calypso' ),
} as const;

export const CATEGORY_ORDER = [
	DISPLAY_CATEGORIES.SITES,
	DISPLAY_CATEGORIES.POSTS,
	DISPLAY_CATEGORIES.PAGES,
	DISPLAY_CATEGORIES.DESIGN,
	DISPLAY_CATEGORIES.DOMAINS,
	DISPLAY_CATEGORIES.ACCOUNT,
	DISPLAY_CATEGORIES.DEVELOPER_TESTING,
	DISPLAY_CATEGORIES.UNCATEGORIZED,
] as const;

/** Maps API category values to display category names (fallback when tool not in explicit map) */
export const API_CATEGORY_TO_DISPLAY: Record< string, string > = {
	user: DISPLAY_CATEGORIES.ACCOUNT,
	content: DISPLAY_CATEGORIES.UNCATEGORIZED,
	site: DISPLAY_CATEGORIES.SITES,
	analytics: DISPLAY_CATEGORIES.SITES,
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
	// Users → Sites
	'site-users': DISPLAY_CATEGORIES.SITES,
	// Plugins → Sites
	'site-plugins': DISPLAY_CATEGORIES.SITES,
	// Analytics → Sites
	'site-statistics': DISPLAY_CATEGORIES.SITES,
	'site-activity-log': DISPLAY_CATEGORIES.SITES,
	// Site Settings → Sites
	'site-settings': DISPLAY_CATEGORIES.SITES,
	// Account
	'user-profile': DISPLAY_CATEGORIES.ACCOUNT,
	'user-achievements': DISPLAY_CATEGORIES.ACCOUNT,
	'user-security': DISPLAY_CATEGORIES.ACCOUNT,
	// Notifications → Account
	'user-notifications': DISPLAY_CATEGORIES.ACCOUNT,
	'user-notifications-inbox': DISPLAY_CATEGORIES.ACCOUNT,
	// Billing → Account
	'user-subscriptions': DISPLAY_CATEGORIES.ACCOUNT,
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
	[ 'media-', DISPLAY_CATEGORIES.SITES ],
	[ 'comments-', DISPLAY_CATEGORIES.POSTS ],
	[ 'site-comments-', DISPLAY_CATEGORIES.POSTS ],
	[ 'categories-', DISPLAY_CATEGORIES.POSTS ],
	[ 'tags-', DISPLAY_CATEGORIES.POSTS ],
	[ 'synced-patterns-', DISPLAY_CATEGORIES.DESIGN ],
	[ 'patterns-', DISPLAY_CATEGORIES.DESIGN ],
	[ 'theme-', DISPLAY_CATEGORIES.DESIGN ],
	[ 'blocks-', DISPLAY_CATEGORIES.DESIGN ],
];

/**
 * Sub-categories within merged display categories.
 * Used to visually separate tools with dividers inside a single card.
 */
const SUB_CATEGORIES = {
	// Posts sub-categories
	POSTS: __( 'Posts', 'calypso' ),
	COMMENTS: __( 'Comments', 'calypso' ),
	CATEGORIES_TAGS: __( 'Categories & tags', 'calypso' ),
	// Sites sub-categories
	SITES: __( 'Sites', 'calypso' ),
	MEDIA: __( 'Media', 'calypso' ),
	PLUGINS: __( 'Plugins', 'calypso' ),
	ANALYTICS: __( 'Analytics', 'calypso' ),
	USERS: __( 'Users', 'calypso' ),
	SITE_SETTINGS: __( 'Site settings', 'calypso' ),
	NOTIFICATIONS: __( 'Notifications', 'calypso' ),
	// Account sub-categories
	ACCOUNT: __( 'Account', 'calypso' ),
} as const;

/**
 * Prefix-based sub-category overrides for tools within merged display categories.
 */
const TOOL_SUB_CATEGORY_OVERRIDES: Array< [ string, string ] > = [
	// Sites sub-categories
	[ 'media-', SUB_CATEGORIES.MEDIA ],
	// Posts sub-categories
	[ 'comments-', SUB_CATEGORIES.COMMENTS ],
	[ 'site-comments-', SUB_CATEGORIES.COMMENTS ],
	[ 'categories-', SUB_CATEGORIES.CATEGORIES_TAGS ],
	[ 'tags-', SUB_CATEGORIES.CATEGORIES_TAGS ],
];

/**
 * Exact-match sub-category overrides for tools within the Sites display category.
 */
const TOOL_SUB_CATEGORY_EXACT_OVERRIDES: Record< string, string > = {
	'site-users': SUB_CATEGORIES.SITE_SETTINGS,
	'site-plugins': SUB_CATEGORIES.SITE_SETTINGS,
	'site-statistics': SUB_CATEGORIES.ANALYTICS,
	'site-activity-log': SUB_CATEGORIES.ANALYTICS,
	'site-settings': SUB_CATEGORIES.SITE_SETTINGS,
	'user-notifications': SUB_CATEGORIES.NOTIFICATIONS,
	'user-notifications-inbox': SUB_CATEGORIES.NOTIFICATIONS,
};

/**
 * Display order for sub-categories within merged cards.
 */
export const SUB_CATEGORY_ORDER: Record< string, readonly string[] > = {
	[ DISPLAY_CATEGORIES.POSTS ]: [
		SUB_CATEGORIES.POSTS,
		SUB_CATEGORIES.COMMENTS,
		SUB_CATEGORIES.CATEGORIES_TAGS,
	],
	[ DISPLAY_CATEGORIES.ACCOUNT ]: [ SUB_CATEGORIES.ACCOUNT, SUB_CATEGORIES.NOTIFICATIONS ],
	[ DISPLAY_CATEGORIES.SITES ]: [
		SUB_CATEGORIES.SITES,
		SUB_CATEGORIES.SITE_SETTINGS,
		SUB_CATEGORIES.MEDIA,
		SUB_CATEGORIES.ANALYTICS,
	],
};

/**
 * Explicit tool ordering within sub-categories.
 * Tools listed here are sorted to the front in the given order;
 * unlisted tools keep their original (API) order after them.
 */
const TOOL_SORT_ORDER: Record< string, string[] > = {
	'user-sites': [ 'user-sites', 'user-sites-resource' ],
	'site-settings': [ 'site-settings', 'site-users', 'site-plugins' ],
};

/**
 * Sort tools within a sub-category according to TOOL_SORT_ORDER.
 */
export function sortTools< T >( tools: Array< [ string, T ] > ): Array< [ string, T ] > {
	// Find the first matching order key
	for ( const [ , order ] of Object.entries( TOOL_SORT_ORDER ) ) {
		const hasMatch = tools.some( ( [ id ] ) => order.includes( id.replace( 'wpcom-mcp/', '' ) ) );
		if ( hasMatch ) {
			return [ ...tools ].sort( ( a, b ) => {
				const aName = a[ 0 ].replace( 'wpcom-mcp/', '' );
				const bName = b[ 0 ].replace( 'wpcom-mcp/', '' );
				const aIdx = order.indexOf( aName );
				const bIdx = order.indexOf( bName );
				if ( aIdx === -1 && bIdx === -1 ) {
					return 0;
				}
				if ( aIdx === -1 ) {
					return 1;
				}
				if ( bIdx === -1 ) {
					return -1;
				}
				return aIdx - bIdx;
			} );
		}
	}
	return tools;
}

/**
 * Get the sub-category for a tool within a merged display category.
 * Returns undefined for tools in categories that don't have sub-categories.
 */
export function getSubCategory( toolId: string ): string | undefined {
	const toolName = toolId.replace( 'wpcom-mcp/', '' );

	// 1. Exact match sub-category overrides
	const exactOverride = TOOL_SUB_CATEGORY_EXACT_OVERRIDES[ toolName ];
	if ( exactOverride ) {
		return exactOverride;
	}

	// 2. Prefix-based sub-category overrides
	for ( const [ prefix, subCategory ] of TOOL_SUB_CATEGORY_OVERRIDES ) {
		if ( toolName.startsWith( prefix ) ) {
			return subCategory;
		}
	}

	// 3. Default sub-category for merged categories
	const category = getDisplayCategory( toolId );
	if ( category === DISPLAY_CATEGORIES.POSTS ) {
		return SUB_CATEGORIES.POSTS;
	}
	if ( category === DISPLAY_CATEGORIES.SITES ) {
		return SUB_CATEGORIES.SITES;
	}
	if ( category === DISPLAY_CATEGORIES.ACCOUNT ) {
		return SUB_CATEGORIES.ACCOUNT;
	}

	return undefined;
}

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
