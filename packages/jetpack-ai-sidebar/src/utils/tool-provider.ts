/**
 * Tool provider — client-side ability definitions and helpers.
 *
 * Used by jetpack-ai-provider.ts (Agents Manager provider module).
 *
 * Title optimization is routed through AM's native `big_sky__show_component`
 * pipeline, so no client-side `wpcom/select-title` ability is registered here;
 * the TitlePicker component is resolved via `getChatComponent('title-picker')`
 * at render time.
 */

import type { Tool } from '@automattic/agenttic-client';

export const UPDATE_BLOCK_CONTENT_TOOL_ID = 'wpcom/update-block-content';

export const UPDATE_BLOCK_CONTENT_ABILITY: Tool = {
	id: UPDATE_BLOCK_CONTENT_TOOL_ID,
	name: UPDATE_BLOCK_CONTENT_TOOL_ID,
	...( { label: 'Update block content', category: 'jetpack-ai' } as any ), // eslint-disable-line @typescript-eslint/no-explicit-any
	description:
		'Update the text content of a specific block in the editor. Use this after translating, changing tone, checking grammar, or any other text transformation. The block will be updated directly in the editor.',
	input_schema: {
		type: 'object',
		properties: {
			clientId: {
				type: 'string',
				description: 'The clientId of the block to update (from selected_block_client_id).',
			},
			content: {
				type: 'string',
				description: 'The new HTML content for the block.',
			},
			summary: {
				type: 'string',
				description: 'A brief user-friendly description of what was changed.',
			},
		},
		required: [ 'clientId', 'content' ],
	},
};

export function isUpdateBlockContentTool( toolId: string ): boolean {
	return toolId === UPDATE_BLOCK_CONTENT_TOOL_ID || toolId === 'wpcom__update_block_content';
}
