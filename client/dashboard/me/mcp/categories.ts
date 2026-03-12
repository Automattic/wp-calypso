/**
 * MCP Tools Category Mapping
 *
 * Maps tool IDs and API categories to display categories for the MCP settings page.
 */

import { __ } from '@wordpress/i18n';

export const DISPLAY_CATEGORIES = {
	SITES_CONTENT: __( 'Sites & Content', 'calypso' ),
	ACCOUNT: __( 'Account', 'calypso' ),
	BILLING: __( 'Billing', 'calypso' ),
	NOTIFICATIONS: __( 'Notifications', 'calypso' ),
	DOMAINS_INTEGRATIONS: __( 'Domains & Integrations', 'calypso' ),
	SITE_CONFIGURATION: __( 'Site Configuration', 'calypso' ),
	DEVELOPER_TESTING: __( 'Developer & Testing', 'calypso' ),
	UNCATEGORIZED: __( 'Uncategorized', 'calypso' ),
} as const;

export const CATEGORY_ORDER = [
	DISPLAY_CATEGORIES.SITES_CONTENT,
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
	content: DISPLAY_CATEGORIES.SITES_CONTENT,
	site: DISPLAY_CATEGORIES.SITE_CONFIGURATION,
	analytics: DISPLAY_CATEGORIES.SITE_CONFIGURATION,
	internal: DISPLAY_CATEGORIES.DEVELOPER_TESTING,
	utility: DISPLAY_CATEGORIES.DEVELOPER_TESTING,
};

/**
 * Tools that need a different display category than their API category (e.g. "user" tools
 * that belong in Sites & Content, Billing, Notifications, or Domains & Integrations).
 */
const TOOL_DISPLAY_OVERRIDES: Record< string, string > = {
	'user-sites-resource': DISPLAY_CATEGORIES.SITES_CONTENT,
	'user-sites': DISPLAY_CATEGORIES.SITES_CONTENT,
	'site-users': DISPLAY_CATEGORIES.SITES_CONTENT,
	'user-domains': DISPLAY_CATEGORIES.DOMAINS_INTEGRATIONS,
	'user-connections': DISPLAY_CATEGORIES.DOMAINS_INTEGRATIONS,
	'user-subscriptions': DISPLAY_CATEGORIES.BILLING,
	'user-notifications': DISPLAY_CATEGORIES.NOTIFICATIONS,
	'user-notifications-inbox': DISPLAY_CATEGORIES.NOTIFICATIONS,
};

/**
 * Get the display category for a tool based on its ID and optional API category.
 * API category is the primary source; overrides apply for tools needing different grouping.
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

	// 2. Use API category as primary source of truth
	const apiCategory = ability?.category;
	if ( apiCategory && API_CATEGORY_TO_DISPLAY[ apiCategory ] ) {
		return API_CATEGORY_TO_DISPLAY[ apiCategory ];
	}

	return DISPLAY_CATEGORIES.UNCATEGORIZED;
}
