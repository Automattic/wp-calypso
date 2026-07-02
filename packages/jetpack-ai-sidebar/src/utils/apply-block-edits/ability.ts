/**
 * Descriptor + matcher for the bundled `big-sky/apply-block-edits` fallback.
 *
 * The name and schema mirror Big Sky's canonical `big-sky/apply-block-edits`
 * ability — the backend wpcom block-editing agent emits this call by the fixed
 * (Agents-Manager-normalized) id `big_sky__apply_block_edits`. Keeping the same
 * name is what lets this fallback stand in on surfaces where the Big Sky
 * provider is not loaded. The eventual fix is moving abilities into Agents
 * Manager itself, which will remove the need for this duplicate.
 */

import type { Tool } from '@automattic/agenttic-client';

export const APPLY_BLOCK_EDITS_TOOL_ID = 'big-sky/apply-block-edits';
export const APPLY_BLOCK_EDITS_NORMALIZED_ID = 'big_sky__apply_block_edits';

export const APPLY_BLOCK_EDITS_ABILITY: Tool = {
	id: APPLY_BLOCK_EDITS_TOOL_ID,
	name: APPLY_BLOCK_EDITS_TOOL_ID,
	...( { label: 'Apply Block Edits', category: 'big-sky' } as any ), // eslint-disable-line @typescript-eslint/no-explicit-any
	description:
		'Applies a collection of block edits (updates, insertions, deletions) to the editor.',
	input_schema: {
		type: 'object',
		properties: {
			updates: {
				type: 'array',
				description: 'Array of block updates to apply.',
			},
			inserts: {
				type: 'array',
				description: 'Array of block insertions to apply.',
			},
			deletes: {
				type: 'array',
				description: 'Array of block deletions (clientIds) to apply.',
			},
			summary: {
				type: 'string',
				description: 'Summary message to show to the user.',
			},
			reverseMap: {
				type: 'object',
				description: 'Optional reverse mapping for client IDs.',
			},
			customCSS: {
				type: 'string',
				description:
					'Not supported on this surface; custom CSS / global styles editing is unavailable here.',
			},
		},
	},
};

export function isApplyBlockEditsTool( toolId: string ): boolean {
	return toolId === APPLY_BLOCK_EDITS_TOOL_ID || toolId === APPLY_BLOCK_EDITS_NORMALIZED_ID;
}
