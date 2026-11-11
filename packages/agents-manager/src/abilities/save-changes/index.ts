import { __ } from '@wordpress/i18n';
import { BIG_SKY_ABILITY_CATEGORY } from '../constants';
import { saveChangesCallback } from './callback';
import type { Ability } from '@wordpress/abilities';

/**
 * Persists all staged editor changes after an explicit request to save that scope.
 */
export const saveChangesAbility: Ability = {
	name: 'big-sky/save-changes',
	label: __( 'Save changes', __i18n_text_domain__ ),
	category: BIG_SKY_ABILITY_CATEGORY,
	description:
		'Save ALL changes currently staged in the editor, including every edited page, template, template part, global styles, navigation, and site settings. This ability cannot save only the current page or distinguish agent edits from other staged edits. Use it only when the user explicitly asks to save, publish, or commit all staged changes. If the user asks to save only a page or a specific change, explain that this saves all staged changes and ask whether they want to save that scope before calling it. Do not call it automatically after making edits or after an edit in the current request was refused.',
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
