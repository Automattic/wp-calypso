import { __ } from '@wordpress/i18n';
import { BIG_SKY_ABILITY_CATEGORY } from '../constants';
import { setSiteLogoCallback } from './callback';
import type { Ability } from '../types';

/**
 * The `set-site-logo` ability definition.
 *
 * The `big-sky/` name and category are the keys the backend route allowlists
 * match on — renaming either drops the ability from every surface.
 */
export const setSiteLogoAbility: Ability = {
	name: 'big-sky/set-site-logo',
	label: __( 'Set Site Logo', __i18n_text_domain__ ),
	category: BIG_SKY_ABILITY_CATEGORY,
	description: __( 'Set the site logo', __i18n_text_domain__ ),
	input_schema: {
		type: 'object',
		properties: {
			fileObj: {
				type: 'object',
				description: 'The uploaded image to use as the site logo.',
				properties: {
					attachment_id: { type: 'string' },
					url: { type: 'string' },
				},
				required: [ 'attachment_id' ],
			},
			followUpTasks: {
				type: 'boolean',
				description:
					'Deprecated. This tool always returns to the agent with a success or error message.',
			},
			summary: {
				type: 'string',
				description:
					"A short, friendly confirmation in the agent's own voice to show to the user after the site logo is set. Mention that the logo was updated briefly.",
			},
		},
		required: [ 'fileObj' ],
	},
	output_schema: {
		type: 'object',
		properties: {
			result: {
				type: 'object',
				properties: {
					success: {
						type: 'boolean',
						description: 'Whether the site logo was set successfully.',
					},
					message: {
						type: 'string',
						description: 'Human-readable success or error message.',
					},
					error: {
						type: 'string',
						description: 'Error details when success is false.',
					},
					details: {
						type: 'object',
						description: 'Optional details about the updated site logo.',
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
	callback: setSiteLogoCallback,
};
