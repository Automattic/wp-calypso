import { parse } from '@wordpress/blocks';
import { isRecord } from '../utils/is-record';
import type { WebMcpAbilityContract, WebMcpExecutionContext } from './types';
import type { Ability } from '../abilities/types';
import type { Block } from '@wordpress/blocks';

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

export const MEDIA_CREATE_ABILITY_NAME = 'wpcom/media-create';
export const WEBMCP_MUTATING_SERVER_ABILITY_NAMES = [ MEDIA_CREATE_ABILITY_NAME ] as const;

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

function rememberBlockClientIds( result: unknown, context: WebMcpExecutionContext ): void {
	if (
		! isRecord( result ) ||
		! isRecord( result.result ) ||
		! isRecord( result.result.details )
	) {
		return;
	}

	const visit = ( blocks: unknown ) => {
		if ( ! Array.isArray( blocks ) ) {
			return;
		}

		for ( const block of blocks ) {
			if ( ! isRecord( block ) ) {
				continue;
			}

			if ( typeof block.clientId === 'string' ) {
				context.knownBlockClientIds.add( block.clientId );
			}
			visit( block.innerBlocks );
		}
	};

	context.knownBlockClientIds.clear();
	visit( result.result.details.blocks );
}

function prepareApplyBlockEditsInput(
	input: Record< string, unknown >,
	context: WebMcpExecutionContext
): Record< string, unknown > {
	const toBlockData = ( block: Block ): Record< string, unknown > => ( {
		name: block.name,
		attributes: block.attributes,
		...( block.innerBlocks.length ? { innerBlocks: block.innerBlocks.map( toBlockData ) } : {} ),
	} );
	const inserts = Array.isArray( input.inserts )
		? input.inserts.flatMap( ( insert ) => {
				if ( ! isRecord( insert ) || typeof insert.blockMarkup !== 'string' ) {
					return [ insert ];
				}

				const blocks = parse( insert.blockMarkup );
				if ( blocks.length === 0 ) {
					throw new Error( 'The supplied blockMarkup did not contain any Gutenberg blocks.' );
				}

				const { blockMarkup: _blockMarkup, block: _block, ...placement } = insert;
				return blocks.map( ( block, offset ) => ( {
					...placement,
					...( typeof placement.index === 'number' ? { index: placement.index + offset } : {} ),
					block: toBlockData( block ),
				} ) );
		  } )
		: undefined;
	const reverseMap = Object.fromEntries(
		Array.from( context.knownBlockClientIds, ( clientId ) => [ clientId, clientId ] )
	);

	return {
		...( Array.isArray( input.updates ) ? { updates: input.updates } : {} ),
		...( inserts ? { inserts } : {} ),
		...( Array.isArray( input.deletes ) ? { deletes: input.deletes } : {} ),
		...( typeof input.summary === 'string' ? { summary: input.summary } : {} ),
		reverseMap,
		suppressAssistantMessage: true,
	};
}

function adaptShowTemplateResult( value: unknown ): unknown {
	if ( typeof value === 'string' ) {
		return value.replaceAll( 'big_sky__get_page_structure', 'agents_manager__get_block_tree' );
	}

	if ( Array.isArray( value ) ) {
		return value.map( adaptShowTemplateResult );
	}

	if ( isRecord( value ) ) {
		return Object.fromEntries(
			Object.entries( value ).map( ( [ key, item ] ) => [ key, adaptShowTemplateResult( item ) ] )
		);
	}

	return value;
}

/**
 * The abilities whose WebMCP projection differs from the ability itself. The
 * block-tree read feeds the edit tool its client IDs, the edit tool takes a
 * WebMCP-only schema and shapes its input for the Big Sky callback, the
 * template toggle points its next-step guidance at the WebMCP block reader,
 * and the media upload is flagged consequential because it persists a file
 * while the editor edits stay unsaved and reversible.
 */
const WEBMCP_ABILITY_CONTRACTS: Record< string, WebMcpAbilityContract > = {
	[ GET_BLOCK_TREE_ABILITY_NAME ]: {
		afterExecute: rememberBlockClientIds,
	},
	[ APPLY_BLOCK_EDITS_ABILITY_NAME ]: {
		description:
			'Applies deterministic edits to the current block-editor canvas. Call agents_manager__get_block_tree immediately before every edit and use the returned clientId values unchanged. To insert a block pattern, call wpcom__patterns_list, fetch one with wpcom__patterns_get, then pass its content as an insert blockMarkup value. The change remains unsaved and reviewable in the editor.',
		inputSchema: APPLY_BLOCK_EDITS_WEBMCP_INPUT_SCHEMA,
		prepareInput: prepareApplyBlockEditsInput,
	},
	[ MEDIA_CREATE_ABILITY_NAME ]: {
		consequential: true,
	},
	[ SHOW_TEMPLATE_ABILITY_NAME ]: {
		description:
			"Turns on the editor's Show template mode so headers and footers become available to agents_manager__get_block_tree. Use this when the requested header or footer is absent from the block tree, then read the block tree again before editing. This does not unlock a template part that is already visible but locked.",
		adaptResult: adaptShowTemplateResult,
	},
};

const NO_CONTRACT: WebMcpAbilityContract = {};

export function getWebMcpContract( ability: Ability ): WebMcpAbilityContract {
	return WEBMCP_ABILITY_CONTRACTS[ ability.name ] ?? NO_CONTRACT;
}

export function getWebMcpInputSchema( ability: Ability ): Record< string, unknown > | undefined {
	return getWebMcpContract( ability ).inputSchema ?? ability.input_schema;
}

export function getWebMcpDescription( ability: Ability ): string {
	const contract = getWebMcpContract( ability );
	if ( contract.description ) {
		return contract.description;
	}

	const description = ability.description || ability.label || ability.name;
	const instructions = ability.meta?.instructions;

	return typeof instructions === 'string' ? `${ description }\n\n${ instructions }` : description;
}

export function normalizeInputSchema( schema: unknown ): Record< string, unknown > {
	if ( ! isRecord( schema ) ) {
		return { type: 'object', properties: {} };
	}

	if ( ! ( 'type' in schema ) && ! ( 'anyOf' in schema ) && ! ( 'oneOf' in schema ) ) {
		return { ...schema, type: 'object' };
	}

	return schema;
}
