/**
 * MCP Tools Category Mapping
 *
 * Maps API category values to display categories for the MCP settings page.
 * Category values come from abilities-config.php on the backend and are passed
 * through the API response as `ability.category`.
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

/** Maps API category values (from abilities-config.php) to display category labels. */
const API_CATEGORY_TO_DISPLAY: Record< string, string > = {
	posts: DISPLAY_CATEGORIES.POSTS,
	pages: DISPLAY_CATEGORIES.PAGES,
	media: DISPLAY_CATEGORIES.MEDIA,
	comments: DISPLAY_CATEGORIES.COMMENTS,
	'categories-tags': DISPLAY_CATEGORIES.CATEGORIES_TAGS,
	design: DISPLAY_CATEGORIES.DESIGN,
	sites: DISPLAY_CATEGORIES.SITES,
	users: DISPLAY_CATEGORIES.USERS,
	plugins: DISPLAY_CATEGORIES.PLUGINS,
	analytics: DISPLAY_CATEGORIES.ANALYTICS,
	'site-settings': DISPLAY_CATEGORIES.SITE_SETTINGS,
	account: DISPLAY_CATEGORIES.ACCOUNT,
	notifications: DISPLAY_CATEGORIES.NOTIFICATIONS,
	billing: DISPLAY_CATEGORIES.BILLING,
	domains: DISPLAY_CATEGORIES.DOMAINS,
	'developer-testing': DISPLAY_CATEGORIES.DEVELOPER_TESTING,
};

/**
 * No sub-categories — each API category maps to its own top-level card.
 * Kept for interface compatibility with read/write page components.
 */
export const SUB_CATEGORY_ORDER: Record< string, readonly string[] > = {};

/**
 * Pass-through sort — no explicit ordering needed with granular categories.
 * Kept for interface compatibility with read/write page components.
 */
export function sortTools< T >( tools: Array< [ string, T ] > ): Array< [ string, T ] > {
	return tools;
}

/**
 * No sub-categories with granular per-category cards.
 * Kept for interface compatibility with read/write page components.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getSubCategory( toolId: string ): string | undefined {
	return undefined;
}

/**
 * Returns true if a tool should be treated as a write operation.
 * Uses the `readonly` field from the API: a tool is a write tool when readonly is explicitly false.
 * @param toolId - Unused; kept for interface compatibility.
 * @param ability - Optional ability object with readonly flag from API
 * @param ability.readonly - Whether the tool is read-only
 * @returns Whether the tool is a write operation
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isWriteTool( toolId: string, ability?: { readonly?: boolean } ): boolean {
	return ability?.readonly === false;
}

/**
 * Get the display category for a tool based on its API category.
 * @param toolId - Unused; kept for interface compatibility.
 * @param ability - Ability object with category from API
 * @param ability.category - API category value from abilities-config.php
 * @returns The display category label
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getDisplayCategory( toolId: string, ability?: { category?: string } ): string {
	const apiCategory = ability?.category;
	if ( apiCategory && API_CATEGORY_TO_DISPLAY[ apiCategory ] ) {
		return API_CATEGORY_TO_DISPLAY[ apiCategory ];
	}
	return DISPLAY_CATEGORIES.UNCATEGORIZED;
}
