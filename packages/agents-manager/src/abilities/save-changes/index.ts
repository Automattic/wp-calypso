import { __ } from '@wordpress/i18n';
import { BIG_SKY_ABILITY_CATEGORY } from '../constants';
import { saveChangesCallback } from './callback';
import type { Ability } from '../types';

/**
 * Persists the changes currently staged in the editor when the user explicitly
 * asks the agent to save or publish them.
 */
export const saveChangesAbility: Ability = {
	name: 'big-sky/save-changes',
	label: __( 'Save changes', __i18n_text_domain__ ),
	category: BIG_SKY_ABILITY_CATEGORY,
	description: __(
		'Save all changes currently staged in the editor. Use this when the user explicitly asks to save, publish, or commit the changes they are reviewing. Do not call it automatically after making edits.',
		__i18n_text_domain__
	),
	input_schema: {
		type: 'object',
		properties: {},
		additionalProperties: false,
	},
	output_schema: {
		type: 'object',
		properties: {
			result: {
				type: 'object',
				properties: {
					success: { type: 'boolean' },
					message: { type: 'string' },
					error: { type: 'string' },
					details: {
						type: 'object',
						properties: {
							savedEntityCount: { type: 'number' },
							failedEntityCount: { type: 'number' },
						},
					},
				},
				required: [ 'success', 'message' ],
			},
			returnToAgent: { type: 'boolean' },
		},
		required: [ 'result', 'returnToAgent' ],
	},
	meta: {
		annotations: {
			clientRegistered: true,
			readonly: false,
			idempotent: true,
		},
	},
	callback: saveChangesCallback,
};
