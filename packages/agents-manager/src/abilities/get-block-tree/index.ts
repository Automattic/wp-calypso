import { __ } from '@wordpress/i18n';
import { BIG_SKY_ABILITY_CATEGORY } from '../constants';
import { getBlockTreeCallback } from './callback';
import type { Ability } from '../types';

const BLOCK_TREE_NODE_SCHEMA = {
	type: 'object',
	properties: {
		clientId: { type: 'string' },
		name: { type: 'string' },
		attributes: { type: 'object' },
		innerBlocks: {
			type: 'array',
			items: { $ref: '#/$defs/block' },
		},
	},
	required: [ 'clientId', 'name', 'attributes', 'innerBlocks' ],
} as const;

export const getBlockTreeAbility: Ability = {
	name: 'agents-manager/get-block-tree',
	label: __( 'Get Block Tree', __i18n_text_domain__ ),
	category: BIG_SKY_ABILITY_CATEGORY,
	description: __(
		'Reads the current editor block tree, including real client IDs, block names, attributes, nesting, and the selected block. Call this immediately before applying block edits and use the returned client IDs unchanged.',
		__i18n_text_domain__
	),
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
					success: { type: 'boolean' },
					message: { type: 'string' },
					details: {
						type: 'object',
						properties: {
							selectedBlockClientId: { type: [ 'string', 'null' ] },
							blockCount: { type: 'number' },
							blocks: {
								type: 'array',
								items: { $ref: '#/$defs/block' },
							},
						},
						required: [ 'selectedBlockClientId', 'blockCount', 'blocks' ],
					},
				},
				required: [ 'success', 'message', 'details' ],
			},
			returnToAgent: { type: 'boolean' },
		},
		required: [ 'result', 'returnToAgent' ],
		$defs: { block: BLOCK_TREE_NODE_SCHEMA },
	},
	callback: getBlockTreeCallback,
	meta: {
		annotations: {
			readonly: true,
			idempotent: true,
		},
	},
};
