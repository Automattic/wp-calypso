import { __ } from '@wordpress/i18n';
import { BIG_SKY_ABILITY_CATEGORY } from '../constants';
import { showComponentCallback } from './callback';
import { SHOW_COMPONENT_TYPES } from './constants';
import type { Ability } from '../types';

export type { ShowComponentType } from './constants';

/**
 * The `show-component` ability definition.
 *
 * Uses the `big-sky` name and category to match the backend route configuration.
 */
export const showComponentAbility: Ability = {
	name: 'big-sky/show-component',
	label: __( 'Show Component', __i18n_text_domain__ ),
	category: BIG_SKY_ABILITY_CATEGORY,
	description: __( 'Display a component in the UI with specified props', __i18n_text_domain__ ),
	input_schema: {
		type: 'object',
		properties: {
			type: {
				type: 'string',
				description: 'The type of component to show',
				enum: [ ...SHOW_COMPONENT_TYPES ],
			},
			props: {
				type: 'object',
				description: 'The props to pass to the component',
			},
			summary: {
				type: 'string',
				description: 'Summary message to show to the user',
			},
			followUpTasks: {
				type: 'boolean',
				description:
					'Deprecated. This tool always returns to the agent with a success or error message.',
			},
		},
		required: [ 'type', 'props' ],
	},
	output_schema: {
		type: 'object',
		properties: {
			result: {
				type: 'object',
				properties: {
					success: {
						type: 'boolean',
						description: 'Whether the picker was shown successfully.',
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
						description: 'Optional details about the shown picker.',
					},
				},
				required: [ 'success', 'message' ],
			},
			returnToAgent: {
				type: 'boolean',
			},
			agentMessage: {
				type: 'string',
			},
		},
		required: [ 'result', 'returnToAgent' ],
	},
	callback: showComponentCallback,
};
