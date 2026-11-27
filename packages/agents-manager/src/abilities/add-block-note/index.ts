import { __ } from '@wordpress/i18n';
import { BIG_SKY_ABILITY_CATEGORY } from '../constants';
import { addBlockNoteCallback } from './callback';
import type { Ability } from '@wordpress/abilities';

/**
 * Written for browser agents, which read it as the WebMCP tool description, so it names their
 * tools (`agents_manager__…`, `wpcom__…`).
 */
export const addBlockNoteAbility: Ability = {
	name: 'agents-manager/add-block-note',
	label: __( 'Add a block note', __i18n_text_domain__ ),
	category: BIG_SKY_ABILITY_CATEGORY,
	description:
		"Leaves a block note on one block of the post open in the editor, for the author and other editors to read, reply to and resolve. The note starts with \"AI review:\". Where review feedback goes: follow the user's request first. If they ask for notes, use this tool, even on their own post. If they ask for the feedback in the chat, don't use it, even on someone else's post. If they don't say, use notes when someone else wrote the post, and the chat when the user wrote it (agents_manager__get_block_notes reports post.authorIsCurrentUser); in the chat, offer to apply the fixes. For a review, call wpcom__get_content_guidelines and agents_manager__get_block_tree first, give 3 to 8 points in total, one note per block, and say what to change and why in plain text. If the block already has a note, your text is added as a reply. The note is saved at once; its link to the block is saved with the post. Use big_sky__apply_block_edits only for changes the user has asked you to make.",
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
		webmcp: { public: true },
	},
	callback: addBlockNoteCallback,
};
