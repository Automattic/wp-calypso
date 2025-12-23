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

/**
 * Get the display category for a tool based on its ID and API category
 * @param toolId - The tool ID (e.g., 'wpcom-mcp/user-profile')
 * @returns The display category name
 */
export function getDisplayCategory( toolId: string ): string {
	// Extract the tool name from the full ID (e.g., 'user-profile' from 'wpcom-mcp/user-profile')
	const toolName = toolId.replace( 'wpcom-mcp/', '' );

	const TOOL_CATEGORY_MAP: Record< string, string > = {
		// Sites & Content
		'user-sites-resource': DISPLAY_CATEGORIES.SITES_CONTENT,
		'user-sites': DISPLAY_CATEGORIES.SITES_CONTENT,
		'site-users': DISPLAY_CATEGORIES.SITES_CONTENT,
		'posts-search': DISPLAY_CATEGORIES.SITES_CONTENT,
		'post-get': DISPLAY_CATEGORIES.SITES_CONTENT,
		'site-comments-search': DISPLAY_CATEGORIES.SITES_CONTENT,

		// Account
		'user-profile': DISPLAY_CATEGORIES.ACCOUNT,
		'user-security': DISPLAY_CATEGORIES.ACCOUNT,
		'user-achievements': DISPLAY_CATEGORIES.ACCOUNT,

		// Billing
		'user-subscriptions': DISPLAY_CATEGORIES.BILLING,

		// Notifications
		'user-notifications': DISPLAY_CATEGORIES.NOTIFICATIONS,
		'user-notifications-inbox': DISPLAY_CATEGORIES.NOTIFICATIONS,

		// Domains & Integrations
		'user-domains': DISPLAY_CATEGORIES.DOMAINS_INTEGRATIONS,
		'user-connections': DISPLAY_CATEGORIES.DOMAINS_INTEGRATIONS,

		// Site Configuration
		'site-plugins': DISPLAY_CATEGORIES.SITE_CONFIGURATION,
		'site-settings': DISPLAY_CATEGORIES.SITE_CONFIGURATION,
		'site-statistics': DISPLAY_CATEGORIES.SITE_CONFIGURATION,

		// Developer & Testing
		'sample-prompt': DISPLAY_CATEGORIES.DEVELOPER_TESTING,
	};

	return TOOL_CATEGORY_MAP[ toolName ] || DISPLAY_CATEGORIES.UNCATEGORIZED;
}
