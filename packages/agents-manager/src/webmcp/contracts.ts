import type { Ability } from '../abilities/types';

export const GET_BLOCK_TREE_ABILITY_NAME = 'agents-manager/get-block-tree';
export const APPLY_BLOCK_EDITS_ABILITY_NAME = 'big-sky/apply-block-edits';
export const SHOW_TEMPLATE_ABILITY_NAME = 'big-sky/show-template';
export const WEBMCP_SERVER_ABILITY_NAMES = [
	'wpcom/get-block-schemas',
	'wpcom/get-content-guidelines',
	'wpcom/get-posts',
	'wpcom/get-site-stats',
	'wpcom/media-create',
	'wpcom/patterns-list',
	'wpcom/patterns-get',
	'core/get-site-info',
] as const;

export const WEBMCP_MUTATING_SERVER_ABILITY_NAMES = [ 'wpcom/media-create' ] as const;

export type WebMcpServerAbilityName = ( typeof WEBMCP_SERVER_ABILITY_NAMES )[ number ];

export function isWebMcpServerAbilityName( name: string ): name is WebMcpServerAbilityName {
	return ( WEBMCP_SERVER_ABILITY_NAMES as readonly string[] ).includes( name );
}

export function isWebMcpMutatingServerAbilityName( name: string ): boolean {
	return ( WEBMCP_MUTATING_SERVER_ABILITY_NAMES as readonly string[] ).includes( name );
}

const BLOCK_DATA_SCHEMA = {
	type: 'object',
	properties: {
		clientId: {
			type: 'string',
			description:
				'Existing block ID returned by agents_manager__get_block_tree. Omit for a new block.',
		},
		name: {
			type: 'string',
			description: 'Registered block name, for example core/paragraph.',
		},
		attributes: {
			type: 'object',
			description: 'Complete or partial block attributes to apply.',
		},
		innerBlocks: {
			type: 'array',
			items: { $ref: '#/$defs/blockData' },
		},
	},
	required: [ 'name' ],
	additionalProperties: false,
} as const;

export const APPLY_BLOCK_EDITS_WEBMCP_INPUT_SCHEMA: Record< string, unknown > = {
	type: 'object',
	description:
		'Call agents_manager__get_block_tree immediately before this tool. Use its clientId values unchanged.',
	properties: {
		updates: {
			type: 'array',
			description: 'Existing blocks to update.',
			items: {
				allOf: [
					{ $ref: '#/$defs/blockData' },
					{ type: 'object', required: [ 'clientId', 'name' ] },
				],
			},
		},
		inserts: {
			type: 'array',
			description:
				'New blocks to insert. Use blockMarkup with content returned by wpcom__patterns_get to insert a pattern.',
			items: {
				type: 'object',
				properties: {
					parentClientId: {
						type: 'string',
						description:
							'Parent ID returned by agents_manager__get_block_tree. Omit for a root insertion.',
					},
					index: {
						type: 'integer',
						minimum: 0,
						description: 'Zero-based insertion position.',
					},
					block: { $ref: '#/$defs/blockData' },
					blockMarkup: {
						type: 'string',
						description:
							'Serialized Gutenberg block markup returned in the content field by wpcom__patterns_get. All top-level blocks are inserted in order.',
					},
				},
				oneOf: [ { required: [ 'block' ] }, { required: [ 'blockMarkup' ] } ],
				additionalProperties: false,
			},
		},
		deletes: {
			type: 'array',
			description: 'Block IDs returned by agents_manager__get_block_tree to delete.',
			items: { type: 'string' },
		},
		summary: {
			type: 'string',
			description: 'Short description of the changes made.',
		},
	},
	additionalProperties: false,
	$defs: { blockData: BLOCK_DATA_SCHEMA },
};

export function getWebMcpInputSchema( ability: Ability ): Record< string, unknown > | undefined {
	if ( ability.name === APPLY_BLOCK_EDITS_ABILITY_NAME ) {
		return APPLY_BLOCK_EDITS_WEBMCP_INPUT_SCHEMA;
	}

	return ability.input_schema;
}

export function getWebMcpDescription( ability: Ability ): string {
	if ( ability.name === APPLY_BLOCK_EDITS_ABILITY_NAME ) {
		return 'Applies deterministic edits to the current block-editor canvas. Call agents_manager__get_block_tree immediately before every edit and use the returned clientId values unchanged. To insert a block pattern, call wpcom__patterns_list, fetch one with wpcom__patterns_get, then pass its content as an insert blockMarkup value. The change remains unsaved and reviewable in the editor.';
	}

	if ( ability.name === SHOW_TEMPLATE_ABILITY_NAME ) {
		return "Turns on the editor's Show template mode so headers and footers become available to agents_manager__get_block_tree. Use this when the requested header or footer is absent from the block tree, then read the block tree again before editing. This does not unlock a template part that is already visible but locked.";
	}

	const description = ability.description || ability.label || ability.name;
	const instructions = ability.meta?.instructions;

	if ( isWebMcpServerAbilityName( ability.name ) && typeof instructions === 'string' ) {
		return `${ description }\n\n${ instructions }`;
	}

	return description;
}
