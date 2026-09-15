import { __ } from '@wordpress/i18n';
import { BIG_SKY_ABILITY_CATEGORY } from '../constants';
import { streamPageDesignCallback } from './callback';
import type { Ability } from '../types';

/**
 * The `stream-page-design` ability definition.
 *
 * Never called by the model directly: the backend's `wpcom/page-design`
 * ability runs the designer agent, whose streamed tool call is delegated to
 * the client under this name. The `big-sky/` name is the key the backend
 * matches on — renaming it drops the ability from every surface.
 */
export const streamPageDesignAbility: Ability = {
	name: 'big-sky/stream-page-design',
	label: __( 'Stream Page Design', __i18n_text_domain__ ),
	category: BIG_SKY_ABILITY_CATEGORY,
	description: __(
		'Streams generated page-design block markup into the editor for review before saving.',
		__i18n_text_domain__
	),
	input_schema: {
		type: 'object',
		required: [ 'markup' ],
		additionalProperties: false,
		properties: {
			markup: {
				type: 'string',
				description: 'Delimited Gutenberg block markup for the page design stream.',
			},
			summary: {
				type: 'string',
				description:
					'Short, user-friendly summary of the finished page design, in natural language a non-technical user understands. Shown to the user when the design has been staged. No block names or technical details.',
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
						description: 'Whether the generated page design was staged successfully.',
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
						description: 'Optional details about the staged page design.',
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
		},
		required: [ 'result', 'returnToAgent' ],
	},
	meta: {
		streaming: {
			enabled: true,
			mode: 'tool_argument_delta',
			argumentPath: 'markup',
			eagerInputStreaming: true,
		},
		instructions:
			'Use this so generated Gutenberg markup can stream into the editor. The markup argument must contain wpcom:page-design-section delimiters for the page body and an optional style section.',
	},
	callback: streamPageDesignCallback,
};
