import { __ } from '@wordpress/i18n';
import { BIG_SKY_ABILITY_CATEGORY } from '../constants';
import { applyBlockEditsCallback } from './callback';
import type { Ability } from '../types';

/**
 * Never called by the model directly: the backend's block-editing tools
 * produce the edits, delegate them to the client under this name and ack the
 * call from the result envelope. The `big-sky/` name and category are the keys
 * the backend route allowlists match on — renaming either drops the ability
 * from every surface.
 */
export const applyBlockEditsAbility: Ability = {
	name: 'big-sky/apply-block-edits',
	label: __( 'Apply Block Edits', __i18n_text_domain__ ),
	category: BIG_SKY_ABILITY_CATEGORY,
	description: 'Applies a collection of block edits to the canvas',
	input_schema: {
		type: 'object',
		properties: {
			updates: {
				type: 'array',
				description: 'Array of block updates to apply',
			},
			inserts: {
				type: 'array',
				description: 'Array of block insertions to apply',
			},
			deletes: {
				type: 'array',
				description: 'Array of block deletions (clientIds) to apply',
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
			suppressAssistantMessage: {
				type: 'boolean',
				description: 'Whether to suppress assistant message',
			},
			visualCheckPending: {
				type: 'boolean',
				description:
					'Set by the server, never by the model: the acknowledgement for this call may be held back until the canvas capture attached to the result has been looked at. Forwarded to the client only when a capture was actually produced.',
			},
			reverseMap: {
				type: 'object',
				description: 'Optional reverse mapping for client IDs',
			},
			customCSS: {
				type: 'string',
				description: 'Full custom CSS value to replace the site global styles CSS',
			},
		},
	},
	output_schema: {
		type: 'object',
		properties: {
			result: {
				type: 'object',
				properties: {
					success: {
						type: 'boolean',
						description: 'Whether the block edits were applied successfully.',
					},
					message: {
						type: 'string',
						description: 'Human-readable success or error message.',
					},
					outcome: {
						type: 'string',
						enum: [ 'updated', 'no-changes' ],
						description: 'Whether a successful call changed editor content.',
					},
					changeType: {
						type: 'string',
						enum: [ 'text-content', 'other' ],
						description:
							'Whether the edit only updated block text content or included another change type.',
					},
					error: {
						type: 'string',
						description: 'Error details when success is false.',
					},
					details: {
						type: 'object',
						description: 'Optional details about the applied changes.',
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
			__file_parts: {
				type: 'array',
				description:
					'Files (typically a canvas screenshot) sent alongside the result rather than inside it. Omitted when the tool produced none.',
			},
		},
		required: [ 'result', 'returnToAgent' ],
	},
	callback: applyBlockEditsCallback,
};
