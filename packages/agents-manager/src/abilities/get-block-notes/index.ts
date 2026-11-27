import { __ } from '@wordpress/i18n';
import { BIG_SKY_ABILITY_CATEGORY } from '../constants';
import { getBlockNotesCallback } from './callback';
import type { Ability } from '@wordpress/abilities';

/**
 * Written for browser agents, which read it as the WebMCP tool description, so it names their
 * tools (`agents_manager__…`, `wpcom__…`).
 */
export const getBlockNotesAbility: Ability = {
	name: 'agents-manager/get-block-notes',
	label: __( 'Read block notes', __i18n_text_domain__ ),
	category: BIG_SKY_ABILITY_CATEGORY,
	description:
		"Lists the block notes on the post open in the editor: each thread's blocks, status (open or resolved), author, text and replies. Call it before a review, so you don't repeat a point that is already open or that a teammate resolved, and to read replies to earlier review notes. It also reports who wrote the post (post.authorName, post.authorIsCurrentUser).",
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
		webmcp: { public: true },
	},
	callback: getBlockNotesCallback,
};
