/**
 * MCP Tools Category Mapping
 *
 * Maps API category values to display categories and sub-categories for the
 * MCP settings page. Category values come from abilities-config.php on the
 * backend and are passed through the API response as `ability.category`.
 *
 * Display categories are coarser than API categories: several API categories
 * are merged into a single card with visual sub-category dividers.
 *
 *   Posts card:   posts | comments | categories-tags
 *   Sites card:   sites | media | users | plugins | site-settings | analytics
 *   Design card:  design (themes, patterns, blocks, templates, global styles, navigation)
 *   Account card: account | notifications | billing
 *
 * Design-card tools all share `design` as their API category, so sub-groups within the
 * Design card are derived from tool ID prefixes in getSubCategory().
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

/**
 * Sub-categories within merged display cards.
 * Used to visually separate tools with dividers inside a single card.
 */
const SUB_CATEGORIES = {
	// Posts sub-categories
	POSTS: __( 'Posts', 'calypso' ),
	COMMENTS: __( 'Comments', 'calypso' ),
	CATEGORIES_TAGS: __( 'Categories & tags', 'calypso' ),
	// Sites sub-categories
	SITES: __( 'Sites', 'calypso' ),
	PLUGINS: __( 'Plugins', 'calypso' ),
	MEDIA: __( 'Media', 'calypso' ),
	SITE_SETTINGS: __( 'Site settings', 'calypso' ),
	ANALYTICS: __( 'Analytics', 'calypso' ),
	// Account sub-categories
	ACCOUNT: __( 'Account', 'calypso' ),
	NOTIFICATIONS: __( 'Notifications', 'calypso' ),
	// Design sub-categories
	THEMES: __( 'Themes', 'calypso' ),
	PATTERNS: __( 'Patterns', 'calypso' ),
	TEMPLATES: __( 'Templates', 'calypso' ),
	GLOBAL_STYLES: __( 'Global styles', 'calypso' ),
	NAVIGATION: __( 'Navigation', 'calypso' ),
	BLOCKS: __( 'Blocks', 'calypso' ),
} as const;

/**
 * Display order for sub-categories within merged cards.
 */
export const SUB_CATEGORY_ORDER: Record< string, readonly string[] > = {
	[ DISPLAY_CATEGORIES.POSTS ]: [
		SUB_CATEGORIES.POSTS,
		SUB_CATEGORIES.COMMENTS,
		SUB_CATEGORIES.CATEGORIES_TAGS,
	],
	[ DISPLAY_CATEGORIES.SITES ]: [
		SUB_CATEGORIES.SITES,
		SUB_CATEGORIES.PLUGINS,
		SUB_CATEGORIES.SITE_SETTINGS,
		SUB_CATEGORIES.MEDIA,
		SUB_CATEGORIES.ANALYTICS,
	],
	[ DISPLAY_CATEGORIES.ACCOUNT ]: [ SUB_CATEGORIES.ACCOUNT, SUB_CATEGORIES.NOTIFICATIONS ],
	[ DISPLAY_CATEGORIES.DESIGN ]: [
		SUB_CATEGORIES.THEMES,
		SUB_CATEGORIES.PATTERNS,
		SUB_CATEGORIES.TEMPLATES,
		SUB_CATEGORIES.GLOBAL_STYLES,
		SUB_CATEGORIES.NAVIGATION,
		SUB_CATEGORIES.BLOCKS,
	],
};

/**
 * Maps API category values to the merged display card they belong to.
 * Multiple API categories can map to the same display category.
 */
const API_CATEGORY_TO_DISPLAY: Record< string, string > = {
	// Posts card
	posts: DISPLAY_CATEGORIES.POSTS,
	comments: DISPLAY_CATEGORIES.POSTS,
	'categories-tags': DISPLAY_CATEGORIES.POSTS,
	// Pages card
	pages: DISPLAY_CATEGORIES.PAGES,
	// Design card — all design tools share the 'design' category
	design: DISPLAY_CATEGORIES.DESIGN,
	// Sites card
	sites: DISPLAY_CATEGORIES.SITES,
	media: DISPLAY_CATEGORIES.SITES,
	users: DISPLAY_CATEGORIES.SITES,
	plugins: DISPLAY_CATEGORIES.SITES,
	'site-settings': DISPLAY_CATEGORIES.SITES,
	analytics: DISPLAY_CATEGORIES.SITES,
	// Account card
	account: DISPLAY_CATEGORIES.ACCOUNT,
	notifications: DISPLAY_CATEGORIES.ACCOUNT,
	billing: DISPLAY_CATEGORIES.ACCOUNT,
	// Domains card
	domains: DISPLAY_CATEGORIES.DOMAINS,
	// Developer & testing card
	'developer-testing': DISPLAY_CATEGORIES.DEVELOPER_TESTING,
};

/**
 * Maps API category values to the sub-category divider within their display card.
 * Only needed for API categories that are merged into a card with multiple sub-groups.
 *
 * Design-card tools all share `design` as their API category, so their sub-groups
 * are derived from tool ID prefixes in getSubCategory() instead.
 */
const API_CATEGORY_TO_SUB_CATEGORY: Record< string, string > = {
	// Posts card sub-categories
	posts: SUB_CATEGORIES.POSTS,
	comments: SUB_CATEGORIES.COMMENTS,
	'categories-tags': SUB_CATEGORIES.CATEGORIES_TAGS,
	// Sites card sub-categories
	sites: SUB_CATEGORIES.SITES,
	media: SUB_CATEGORIES.MEDIA,
	users: SUB_CATEGORIES.SITE_SETTINGS,
	plugins: SUB_CATEGORIES.PLUGINS,
	'site-settings': SUB_CATEGORIES.SITE_SETTINGS,
	analytics: SUB_CATEGORIES.ANALYTICS,
	// Account card sub-categories
	account: SUB_CATEGORIES.ACCOUNT,
	notifications: SUB_CATEGORIES.NOTIFICATIONS,
	billing: SUB_CATEGORIES.ACCOUNT,
};

/**
 * Maps tool ID prefixes to Design-card sub-categories.
 * All Design tools share `design` as their API category, so the tool ID is the only
 * signal available for sub-grouping within the card.
 */
const TOOL_ID_PREFIX_TO_DESIGN_SUB_CATEGORY: Record< string, string > = {
	'wpcom-mcp/theme-': SUB_CATEGORIES.THEMES,
	'wpcom-mcp/themes-': SUB_CATEGORIES.THEMES,
	'wpcom-mcp/patterns-': SUB_CATEGORIES.PATTERNS,
	'wpcom-mcp/synced-patterns-': SUB_CATEGORIES.PATTERNS,
	'wpcom-mcp/templates-': SUB_CATEGORIES.TEMPLATES,
	'wpcom-mcp/template-parts-': SUB_CATEGORIES.TEMPLATES,
	'wpcom-mcp/global-styles-': SUB_CATEGORIES.GLOBAL_STYLES,
	'wpcom-mcp/navigation-': SUB_CATEGORIES.NAVIGATION,
	'wpcom-mcp/menus-': SUB_CATEGORIES.NAVIGATION,
	'wpcom-mcp/menu-items-': SUB_CATEGORIES.NAVIGATION,
	'wpcom-mcp/blocks-': SUB_CATEGORIES.BLOCKS,
};

/**
 * Pass-through sort — preserved for interface compatibility.
 */
export function sortTools< T >( tools: Array< [ string, T ] > ): Array< [ string, T ] > {
	return tools;
}

/**
 * Get the sub-category for a tool within its merged display card.
 * Returns undefined for tools in cards that have no sub-category dividers.
 */
export function getSubCategory(
	toolId: string,
	ability?: { category?: string }
): string | undefined {
	const apiCategory = ability?.category;

	// Design-card tools use tool ID prefix for sub-grouping. This covers both
	// 'design'-category tools and 'sites'-category tools that are routed to the
	// Design card by getDisplayCategory (e.g. navigation, menus, themes).
	if ( apiCategory === 'design' || apiCategory === 'sites' ) {
		for ( const [ prefix, subCategory ] of Object.entries(
			TOOL_ID_PREFIX_TO_DESIGN_SUB_CATEGORY
		) ) {
			if ( toolId.startsWith( prefix ) ) {
				return subCategory;
			}
		}
		// 'sites'-category tools with no Design prefix stay in the Sites card's Sites sub-group.
		if ( apiCategory === 'sites' ) {
			return API_CATEGORY_TO_SUB_CATEGORY[ 'sites' ];
		}
		return undefined;
	}

	if ( apiCategory ) {
		return API_CATEGORY_TO_SUB_CATEGORY[ apiCategory ];
	}
	return undefined;
}

/**
 * Returns true if a tool should be treated as a write operation.
 * Uses the `readonly` field from the API: a tool is a write tool when readonly is explicitly false.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isWriteTool( toolId: string, ability?: { readonly?: boolean } ): boolean {
	return ability?.readonly === false;
}

/**
 * Get the display category (card) for a tool based on its API category.
 *
 * Navigation, menus, and theme tools may carry `category: 'sites'` from the
 * backend but belong in the Design card. Tool ID prefix takes precedence over
 * the API category for these tools.
 */
export function getDisplayCategory( toolId: string, ability?: { category?: string } ): string {
	const apiCategory = ability?.category;

	// For 'design' and 'sites' category tools, check if the tool ID prefix
	// indicates it belongs in the Design card.
	if ( apiCategory === 'design' || apiCategory === 'sites' ) {
		for ( const prefix of Object.keys( TOOL_ID_PREFIX_TO_DESIGN_SUB_CATEGORY ) ) {
			if ( toolId.startsWith( prefix ) ) {
				return DISPLAY_CATEGORIES.DESIGN;
			}
		}
	}

	if ( apiCategory && API_CATEGORY_TO_DISPLAY[ apiCategory ] ) {
		return API_CATEGORY_TO_DISPLAY[ apiCategory ];
	}
	return DISPLAY_CATEGORIES.UNCATEGORIZED;
}
