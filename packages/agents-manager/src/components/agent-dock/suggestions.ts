import { __ } from '@wordpress/i18n';
import type { Suggestion } from '@automattic/agenttic-ui';

/**
 * Get empty view suggestions for WP Admin contexts
 * These suggestions are focused on common WordPress admin tasks
 * @returns Array of suggestion objects
 */
export const getWpAdminEmptyViewSuggestions = (): Suggestion[] => {
	return [
		{
			id: 'manage-posts',
			label: __( 'Manage posts', 'agents-manager' ),
			prompt: __( 'Show me my recent posts', 'agents-manager' ),
		},
		{
			id: 'create-content',
			label: __( 'Create content', 'agents-manager' ),
			prompt: __( 'Help me create a new post', 'agents-manager' ),
		},
		{
			id: 'check-site-health',
			label: __( 'Check site health', 'agents-manager' ),
			prompt: __( 'Show me my site health status', 'agents-manager' ),
		},
		{
			id: 'review-comments',
			label: __( 'Review comments', 'agents-manager' ),
			prompt: __( 'Show me recent comments', 'agents-manager' ),
		},
		{
			id: 'what-can-you-do',
			label: __( 'What else can you do?', 'agents-manager' ),
			prompt: __( 'Tell me what you can do for me', 'agents-manager' ),
		},
	];
};

/**
 * Get empty view suggestions for CIAB Admin (store) contexts
 * These suggestions are focused on WooCommerce store management
 * @returns Array of suggestion objects
 */
export const getCiabAdminEmptyViewSuggestions = (): Suggestion[] => {
	return [
		{
			id: 'view-recent-orders',
			label: __( 'View recent orders', 'agents-manager' ),
			prompt: __( 'Show me my recent orders', 'agents-manager' ),
		},
		{
			id: 'check-inventory',
			label: __( 'Check product inventory', 'agents-manager' ),
			prompt: __( 'Show me products that are low in stock', 'agents-manager' ),
		},
		{
			id: 'create-product',
			label: __( 'Create a product', 'agents-manager' ),
			prompt: __( 'Help me create a new product for ', 'agents-manager' ),
		},
		{
			id: 'review-analytics',
			label: __( 'Review analytics', 'agents-manager' ),
			prompt: __( 'Show me my store analytics', 'agents-manager' ),
		},
		{
			id: 'what-can-you-do',
			label: __( 'What else can you do?', 'agents-manager' ),
			prompt: __( 'Tell me what you can do for me', 'agents-manager' ),
		},
	];
};
