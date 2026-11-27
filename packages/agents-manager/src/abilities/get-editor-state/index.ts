import { __ } from '@wordpress/i18n';
import { BIG_SKY_ABILITY_CATEGORY } from '../constants';
import { getEditorStateCallback } from './callback';
import type { Ability } from '@wordpress/abilities';

const RECORD_ID_SCHEMA = { type: [ 'number', 'string' ] } as const;

export const getEditorStateAbility: Ability = {
	name: 'agents-manager/get-editor-state',
	label: __( 'Get Editor State', __i18n_text_domain__ ),
	category: BIG_SKY_ABILITY_CATEGORY,
	description:
		'Reads what the editor has open and what is unsaved: the open post, page or template with its saved status (null when none is open), and every record with unsaved changes. If the open post\'s status is "publish", visitors already see it, so saving it changes the live site. Use this to tell the user what to review and save.',
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
					details: {
						type: 'object',
						properties: {
							open: {
								type: [ 'object', 'null' ],
								properties: {
									type: { type: 'string' },
									id: RECORD_ID_SCHEMA,
									title: { type: 'string' },
									status: { type: 'string' },
								},
								required: [ 'type', 'id' ],
							},
							unsavedChanges: {
								type: 'array',
								items: {
									type: 'object',
									properties: {
										type: { type: 'string' },
										id: RECORD_ID_SCHEMA,
										title: { type: 'string' },
									},
									required: [ 'type', 'title' ],
								},
							},
						},
						required: [ 'open', 'unsavedChanges' ],
					},
				},
				required: [ 'success', 'message', 'details' ],
			},
			returnToAgent: { type: 'boolean' },
		},
		required: [ 'result', 'returnToAgent' ],
	},
	callback: getEditorStateCallback,
	meta: {
		annotations: {
			readonly: true,
			idempotent: true,
		},
		webmcp: { public: true },
	},
};
