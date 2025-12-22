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
 * @param apiCategory - The category from the API (e.g., 'user', 'content', 'site')
 * @returns The display category name
 */
export function getDisplayCategory( toolId: string, apiCategory: string ): string {
	// Extract the tool name from the full ID (e.g., 'user-profile' from 'wpcom-mcp/user-profile')
	const toolName = toolId.replace( 'wpcom-mcp/', '' );

	// Sites & Content
	if (
		toolName === 'user-sites-resource' ||
		toolName === 'user-sites' ||
		toolName === 'site-users' ||
		toolName === 'posts-search' ||
		toolName === 'post-get' ||
		toolName === 'site-comments-search'
	) {
		return DISPLAY_CATEGORIES.SITES_CONTENT;
	}

	// Account
	if (
		toolName === 'user-profile' ||
		toolName === 'user-security' ||
		toolName === 'user-achievements'
	) {
		return DISPLAY_CATEGORIES.ACCOUNT;
	}

	// Billing
	if ( toolName === 'user-subscriptions' ) {
		return DISPLAY_CATEGORIES.BILLING;
	}

	// Notifications
	if ( toolName === 'user-notifications' || toolName === 'user-notifications-inbox' ) {
		return DISPLAY_CATEGORIES.NOTIFICATIONS;
	}

	// Domains & Integrations
	if ( toolName === 'user-domains' || toolName === 'user-connections' ) {
		return DISPLAY_CATEGORIES.DOMAINS_INTEGRATIONS;
	}

	// Site Configuration
	if (
		toolName === 'site-plugins' ||
		toolName === 'site-settings' ||
		toolName === 'site-statistics'
	) {
		return DISPLAY_CATEGORIES.SITE_CONFIGURATION;
	}

	// Developer & Testing
	if ( toolName === 'sample-prompt' ) {
		return DISPLAY_CATEGORIES.DEVELOPER_TESTING;
	}

	// Default to either the API category or uncategorized
	return apiCategory || DISPLAY_CATEGORIES.UNCATEGORIZED;
}
