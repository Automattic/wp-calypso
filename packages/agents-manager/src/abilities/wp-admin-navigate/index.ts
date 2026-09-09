import { __ } from '@wordpress/i18n';
import { BIG_SKY_ABILITY_CATEGORY } from '../constants';
import { wpAdminNavigateCallback } from './callback';
import type { Ability } from '../types';

/**
 * The `wp-admin-navigate` ability definition.
 *
 * The `wp-admin/navigate` name is the key the backend route allowlists match
 * on — renaming it silently drops the ability from every surface.
 */
export const wpAdminNavigateAbility: Ability = {
	name: 'wp-admin/navigate',
	label: __( 'Navigate to wp-admin page', __i18n_text_domain__ ),
	category: BIG_SKY_ABILITY_CATEGORY,
	description: __(
		'Navigate the browser to a different wp-admin page. Use this whenever the user asks to go to, open, or be taken to an admin screen (e.g., "go to plugins", "take me to the settings page") — prefer it over replying with a link. The page will reload, but the conversation will automatically continue after navigation completes.',
		__i18n_text_domain__
	),
	input_schema: {
		type: 'object',
		properties: {
			path: {
				type: 'string',
				description:
					'The wp-admin path to navigate to (e.g., "/wp-admin/plugins.php", "/wp-admin/admin.php?page=wc-settings"). Must start with "/wp-admin/".',
			},
		},
		required: [ 'path' ],
	},
	output_schema: {
		type: 'object',
		properties: {
			result: {
				type: 'object',
				properties: {
					success: {
						type: 'boolean',
						description: 'Whether the navigation was scheduled successfully.',
					},
					message: {
						type: 'string',
						description: 'Human-readable success or error message.',
					},
					error: {
						type: 'string',
						description: 'Error details when success is false.',
					},
				},
				required: [ 'success', 'message' ],
			},
			returnToAgent: {
				type: 'boolean',
			},
		},
		required: [ 'result', 'returnToAgent' ],
	},
	callback: wpAdminNavigateCallback,
};
