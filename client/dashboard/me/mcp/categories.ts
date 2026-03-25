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
 *   Posts card:  posts | comments | categories-tags
 *   Sites card:  sites | media | users/plugins/site-settings | analytics
 *   Account card: account | notifications | billing
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
	MEDIA: __( 'Media', 'calypso' ),
	SITE_SETTINGS: __( 'Site settings', 'calypso' ),
	ANALYTICS: __( 'Analytics', 'calypso' ),
	// Account sub-categories
	ACCOUNT: __( 'Account', 'calypso' ),
	NOTIFICATIONS: __( 'Notifications', 'calypso' ),
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
		SUB_CATEGORIES.SITE_SETTINGS,
		SUB_CATEGORIES.MEDIA,
		SUB_CATEGORIES.ANALYTICS,
	],
	[ DISPLAY_CATEGORIES.ACCOUNT ]: [ SUB_CATEGORIES.ACCOUNT, SUB_CATEGORIES.NOTIFICATIONS ],
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
	// Design card
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
	plugins: SUB_CATEGORIES.SITE_SETTINGS,
	'site-settings': SUB_CATEGORIES.SITE_SETTINGS,
	analytics: SUB_CATEGORIES.ANALYTICS,
	// Account card sub-categories
	account: SUB_CATEGORIES.ACCOUNT,
	notifications: SUB_CATEGORIES.NOTIFICATIONS,
	billing: SUB_CATEGORIES.ACCOUNT,
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
 * @param toolId - Unused; kept for interface compatibility.
 * @param ability - Ability object with category from API
 * @param ability.category - API category value from abilities-config.php
 * @returns The sub-category label, or undefined
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getSubCategory(
	toolId: string,
	ability?: { category?: string }
): string | undefined {
	const apiCategory = ability?.category;
	if ( apiCategory ) {
		return API_CATEGORY_TO_SUB_CATEGORY[ apiCategory ];
	}
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
 * Get the display category (card) for a tool based on its API category.
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
