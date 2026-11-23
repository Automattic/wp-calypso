import type { Ability } from '@wordpress/abilities';

export const GET_BLOCK_TREE_ABILITY_NAME = 'agents-manager/get-block-tree';
export const APPLY_BLOCK_EDITS_ABILITY_NAME = 'big-sky/apply-block-edits';
export const SHOW_TEMPLATE_ABILITY_NAME = 'big-sky/show-template';
export const EDIT_ENTITY_RECORD_ABILITY_NAME = 'big-sky/edit-entity-record';
export const WEBMCP_SERVER_ABILITY_NAMES = [
	'wpcom/get-block-schemas',
	'wpcom/get-content-guidelines',
	'core/get-site-info',
] as const;

export type WebMcpServerAbilityName = ( typeof WEBMCP_SERVER_ABILITY_NAMES )[ number ];

export function isWebMcpServerAbilityName( name: string ): name is WebMcpServerAbilityName {
	return ( WEBMCP_SERVER_ABILITY_NAMES as readonly string[] ).includes( name );
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
				'New blocks to insert. Use blockMarkup to insert serialized Gutenberg block markup.',
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
							'Serialized Gutenberg block markup, using <!-- wp:name {attributes} --> comment delimiters. All top-level blocks are inserted in order.',
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

/** Narrowed because the full ability also creates, deletes and saves records across the site. */
export const EDIT_ENTITY_RECORD_WEBMCP_INPUT_SCHEMA: Record< string, unknown > = {
	type: 'object',
	description:
		'Through this tool, only the title or excerpt of the post or page open in the editor can change. Creating, deleting or editing any other record is refused.',
	properties: {
		title: {
			type: 'string',
			description: 'New title for the post or page open in the editor.',
		},
		excerpt: {
			type: 'string',
			description: 'New excerpt for the post or page open in the editor.',
		},
	},
	minProperties: 1,
	additionalProperties: false,
};

export function getWebMcpInputSchema( ability: Ability ): Record< string, unknown > | undefined {
	if ( ability.name === APPLY_BLOCK_EDITS_ABILITY_NAME ) {
		return APPLY_BLOCK_EDITS_WEBMCP_INPUT_SCHEMA;
	}

	if ( ability.name === EDIT_ENTITY_RECORD_ABILITY_NAME ) {
		return EDIT_ENTITY_RECORD_WEBMCP_INPUT_SCHEMA;
	}

	return ability.input_schema;
}

export function getWebMcpDescription( ability: Ability ): string {
	const description = ability.description || ability.label || ability.name;
	const instructions = ability.meta?.instructions;

	if ( isWebMcpServerAbilityName( ability.name ) && typeof instructions === 'string' ) {
		return `${ description }\n\n${ instructions }`;
	}

	return description;
}
