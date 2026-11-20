import { __ } from '@wordpress/i18n';
import { BIG_SKY_ABILITY_CATEGORY } from '../constants';
import { addBlockNoteCallback } from './callback';
import type { Ability } from '@wordpress/abilities';

export const addBlockNoteAbility: Ability = {
	name: 'agents-manager/add-block-note',
	label: __( 'Add a block note', __i18n_text_domain__ ),
	category: BIG_SKY_ABILITY_CATEGORY,
	description:
		'Leave a note (review comment) on one block of the post open in the block editor. If the block already has a note, this adds a reply to that thread instead. The note is plain text and starts with "AI review:". Use get-block-notes first to see existing feedback. Tell the user to save the post afterwards.',
	input_schema: {
		type: 'object',
		properties: {
			clientId: {
				type: 'string',
				description: 'The client id of the block to attach the note to.',
			},
			text: {
				type: 'string',
				description: 'The note text, plain text, 1 to 2000 characters.',
				minLength: 1,
				maxLength: 2000,
			},
		},
		required: [ 'clientId', 'text' ],
		additionalProperties: false,
	},
	output_schema: {
		type: 'object',
		properties: {
			result: {
				type: 'object',
				properties: {
					success: {
						type: 'boolean',
						description: 'Whether the note was added.',
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
						description: 'The note id, the thread id, whether it was a reply, and the next step.',
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
	meta: {
		annotations: {
			clientRegistered: true,
			readonly: false,
			idempotent: false,
		},
	},
	callback: addBlockNoteCallback,
};
