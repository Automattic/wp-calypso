import { __ } from '@wordpress/i18n';
import { BIG_SKY_ABILITY_CATEGORY } from '../constants';
import { restoreCheckpointCallback } from './callback';
import type { Ability } from '../types';

/**
 * The `restore-checkpoint` ability definition.
 *
 * Keeps the `big-sky/` name so the backend route allowlists keep matching;
 * the schema and prompt text mirror Big Sky's registration.
 */
export const restoreCheckpointAbility: Ability = {
	name: 'big-sky/restore-checkpoint',
	label: __( 'Restore Checkpoint', __i18n_text_domain__ ),
	category: BIG_SKY_ABILITY_CATEGORY,
	description: __(
		'Restores editor state from a checkpoint associated with a previous mutating tool call. Use for undo/redo requests. Prefer checkpointId values from clientContext.availableCheckpoints whose toolId matches the user intent: block-edit checkpoints for content changes, theme-update checkpoints for style/theme changes, and navigation/entity checkpoints for navigation/entity changes. For undo, use the checkpointId for the most recent relevant non-restore mutating Big Sky tool call. Only use a checkpoint whose toolId is big_sky__restore_checkpoint for explicit redo requests, because those checkpoints represent the state before a prior undo/restore. Pass requestIntentType to describe the user intent: "undo" for undo requests, "redo" for redo requests, or "restore" when restoring a specific checkpoint/version. The checkpoint ID usually starts with "toolu_". Do not use the current restore-checkpoint call ID, any id starting with "call_", a tool name/id, or calypsoCheckpointId/messageId. If the user reports missing homepage/footer/navigation content, do not rebuild or redesign unless the user explicitly agrees; try a relevant checkpoint, WordPress revisions, or support escalation instead.',
		__i18n_text_domain__
	),
	input_schema: {
		type: 'object',
		required: [ 'checkpointId', 'summary', 'requestIntentType' ],
		properties: {
			checkpointId: {
				type: 'string',
				description:
					'The exact checkpoint ID to restore. Prefer a checkpointId from clientContext.availableCheckpoints. For undo, use the checkpointId for the most recent relevant non-restore mutating Big Sky tool call whose toolId matches the change to undo, for example a previous big_sky__apply_block_edits checkpoint for content edits or big_sky__apply_update_theme for theme edits. Use big_sky__restore_checkpoint checkpoint IDs only for explicit redo requests. Do NOT pass the current big_sky__restore_checkpoint toolCallId. Do NOT pass any id beginning with "call_". Do NOT pass a tool name/id such as big_sky__apply_block_edits, call_wpcom__rewrite_content, a messageId, or calypsoCheckpointId.',
			},
			summary: {
				type: 'string',
				description:
					"A short, friendly confirmation in the agent's own voice to show to the user after the checkpoint is restored. Mention what was undone or redone briefly.",
			},
			requestIntentType: {
				type: 'string',
				enum: [ 'undo', 'redo', 'restore' ],
				description:
					'The user intent for this restore operation. Use "undo" when the user asks to undo, "redo" when the user asks to redo, and "restore" when the user asks to restore a specific checkpoint/version.',
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
						description: 'Whether the checkpoint was restored successfully.',
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
						description: 'Optional details about the restored checkpoint.',
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
	callback: restoreCheckpointCallback,
};
