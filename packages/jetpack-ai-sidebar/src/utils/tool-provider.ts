/**
 * Title optimization tool provider — ability definition and helpers.
 *
 * Used by jetpack-ai-provider.ts (Agents Manager provider module).
 */

import type { Tool } from '@automattic/agenttic-client';

export const SELECT_TITLE_TOOL_ID = 'wpcom/select-title';

export const SELECT_TITLE_ABILITY: Tool = {
	id: SELECT_TITLE_TOOL_ID,
	name: SELECT_TITLE_TOOL_ID,
	...( { label: 'Select title', category: 'jetpack-ai' } as any ), // eslint-disable-line @typescript-eslint/no-explicit-any
	description:
		'Present title suggestions to the user for selection. Call this after generating optimized title options. The user will see a picker UI and can choose one to apply to their post.',
	input_schema: {
		type: 'object',
		properties: {
			titles: {
				type: 'array',
				description: 'Array of title suggestions with explanations',
				items: {
					type: 'object',
					properties: {
						title: { type: 'string', description: 'The suggested title' },
						explanation: {
							type: 'string',
							description: 'Why this title is effective',
						},
					},
					required: [ 'title' ],
				},
			},
		},
		required: [ 'titles' ],
	},
};

export function isSelectTitleTool( toolId: string ): boolean {
	return toolId === SELECT_TITLE_TOOL_ID || toolId === 'wpcom__select_title';
}

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
