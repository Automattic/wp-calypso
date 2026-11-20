import { __ } from '@wordpress/i18n';
import { BIG_SKY_ABILITY_CATEGORY } from '../constants';
import { getBlockNotesCallback } from './callback';
import type { Ability } from '@wordpress/abilities';

export const getBlockNotesAbility: Ability = {
	name: 'agents-manager/get-block-notes',
	label: __( 'Read block notes', __i18n_text_domain__ ),
	category: BIG_SKY_ABILITY_CATEGORY,
	description:
		'Read the notes (review comments) on the post open in the block editor. Returns each thread with its status (open or resolved), its author, its text, its replies, and the client ids of the blocks it is attached to. Use this before adding a note or when asked what feedback a post has.',
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
					success: {
						type: 'boolean',
						description: 'Whether the notes were read.',
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
						description: 'The notes on the post, as a list of threads.',
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
			readonly: true,
			idempotent: true,
		},
	},
	callback: getBlockNotesCallback,
};
