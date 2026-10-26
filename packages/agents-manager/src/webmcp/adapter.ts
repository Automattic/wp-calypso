import { createWebMcpToolRegistry } from '@automattic/webmcp';
import { parse } from '@wordpress/blocks';
import { normalizeAbilityName } from '../abilities/ability-name';
import { isRecord } from '../utils/is-record';
import {
	APPLY_BLOCK_EDITS_ABILITY_NAME,
	GET_BLOCK_TREE_ABILITY_NAME,
	SHOW_TEMPLATE_ABILITY_NAME,
	WEBMCP_SERVER_ABILITY_NAMES,
	getWebMcpDescription,
	getWebMcpInputSchema,
	isWebMcpMutatingServerAbilityName,
} from './contracts';
import type { ToolProvider } from '../extension-types';
import type { WebMcpAdapter, WebMcpModelContext, WebMcpTool } from './types';
import type { Ability } from '@wordpress/abilities';
import type { Block } from '@wordpress/blocks';

export { createWebMcpToolProvider } from './server-ability-provider';

type CreateWebMcpAdapterOptions = {
	toolProvider: ToolProvider;
	modelContext: WebMcpModelContext;
	shouldExposeAbility?: ( ability: Ability ) => boolean;
};

/**
 * Execution remains behind the merged provider's permission checks and canvas
 * guard.
 */
export const WEBMCP_EDITOR_ABILITY_ALLOWLIST = new Set( [
	APPLY_BLOCK_EDITS_ABILITY_NAME,
	GET_BLOCK_TREE_ABILITY_NAME,
	SHOW_TEMPLATE_ABILITY_NAME,
] );

export const WEBMCP_SERVER_ABILITY_ALLOWLIST = new Set< string >( WEBMCP_SERVER_ABILITY_NAMES );

export function shouldExposeWebMcpAbility( ability: Ability ): boolean {
	const annotations = ability.meta?.annotations;

	if ( WEBMCP_SERVER_ABILITY_ALLOWLIST.has( ability.name ) ) {
		return (
			annotations?.serverRegistered === true &&
			( annotations.readonly === true || isWebMcpMutatingServerAbilityName( ability.name ) )
		);
	}

	if ( ! WEBMCP_EDITOR_ABILITY_ALLOWLIST.has( ability.name ) ) {
		return false;
	}

	if ( annotations?.serverRegistered === true ) {
		return false;
	}

	return annotations?.clientRegistered === true || typeof ability.callback === 'function';
}

export function normalizeInputSchema( schema: unknown ): Record< string, unknown > {
	if ( ! schema || typeof schema !== 'object' || Array.isArray( schema ) ) {
		return { type: 'object', properties: {} };
	}

	const normalized = schema as Record< string, unknown >;
	if ( ! ( 'type' in normalized ) && ! ( 'anyOf' in normalized ) && ! ( 'oneOf' in normalized ) ) {
		return { ...normalized, type: 'object' };
	}

	return normalized;
}

type ExecutionContext = {
	knownBlockClientIds: Set< string >;
};

function rememberBlockClientIds( result: unknown, context: ExecutionContext ): void {
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
	context: ExecutionContext
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
	};
}

function adaptResultForWebMcp( abilityName: string, value: unknown ): unknown {
	if ( abilityName !== SHOW_TEMPLATE_ABILITY_NAME ) {
		return value;
	}

	if ( typeof value === 'string' ) {
		return value.replaceAll( 'big_sky__get_page_structure', 'agents_manager__get_block_tree' );
	}

	if ( Array.isArray( value ) ) {
		return value.map( ( item ) => adaptResultForWebMcp( abilityName, item ) );
	}

	if ( isRecord( value ) ) {
		return Object.fromEntries(
			Object.entries( value ).map( ( [ key, item ] ) => [
				key,
				adaptResultForWebMcp( abilityName, item ),
			] )
		);
	}

	return value;
}

function createTool(
	ability: Ability,
	toolProvider: ToolProvider,
	executionContext: ExecutionContext
): WebMcpTool {
	return {
		name: normalizeAbilityName( ability.name ),
		title: ability.label || ability.name,
		description: getWebMcpDescription( ability ),
		inputSchema: normalizeInputSchema( getWebMcpInputSchema( ability ) ),
		annotations: {
			readOnlyHint: ability.meta?.annotations?.readonly === true,
			destructiveHint:
				ability.name === APPLY_BLOCK_EDITS_ABILITY_NAME ||
				ability.meta?.annotations?.destructive === true,
			idempotentHint: ability.meta?.annotations?.idempotent === true,
		},
		execute: async ( input ) => {
			const preparedInput =
				ability.name === APPLY_BLOCK_EDITS_ABILITY_NAME
					? prepareApplyBlockEditsInput( input ?? {}, executionContext )
					: ( input ?? {} );
			const result = await toolProvider.executeAbility( ability.name, preparedInput );

			if ( ability.name === GET_BLOCK_TREE_ABILITY_NAME ) {
				rememberBlockClientIds( result, executionContext );
			}

			return adaptResultForWebMcp( ability.name, result );
		},
	};
}

export function createWebMcpAdapter( {
	toolProvider,
	modelContext,
	shouldExposeAbility = shouldExposeWebMcpAbility,
}: CreateWebMcpAdapterOptions ): WebMcpAdapter {
	const executionContext: ExecutionContext = { knownBlockClientIds: new Set() };
	const registry = createWebMcpToolRegistry( {
		modelContext,
		getTools: async () =>
			( await toolProvider.getAbilities() )
				.filter( shouldExposeAbility )
				.map( ( ability ) => createTool( ability, toolProvider, executionContext ) ),
	} );

	return {
		sync: registry.sync,
		dispose: () => {
			registry.dispose();
			executionContext.knownBlockClientIds.clear();
		},
	};
}
