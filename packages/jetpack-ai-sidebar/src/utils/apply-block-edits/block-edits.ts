/**
 * Pure block-edit engine for the bundled `big-sky/apply-block-edits` fallback.
 *
 * Ported from Big Sky's Easy Site Editor implementation
 * (`packages/easy-site-editor/src/lib/content-editor/block-edits.ts`), trimmed to
 * the block-content-editing subset this surface needs: no custom-CSS / global
 * styles staging and no contentOnly-section unlocking. `createBlock` and the set
 * of registered block types are injected rather than imported so these functions
 * stay free of `@wordpress/*` / `window.wp` coupling and remain unit-testable.
 */

import { __, sprintf } from '@wordpress/i18n';
import type { ApplyBlockEditsArgs, BlockData, BlockInsert, BlockUpdate } from './types';

export interface EditorBlock {
	clientId: string;
	name: string;
	attributes?: Record< string, unknown >;
	innerBlocks?: EditorBlock[];
}

export interface CreatedBlock extends EditorBlock {
	innerBlocks?: CreatedBlock[];
}

export interface NormalizedBlockEdits {
	updates: BlockUpdate[];
	inserts: BlockInsert[];
	deletes: string[];
	customCSS?: string;
	summary?: string;
	followUpTasks?: boolean;
}

export type CreateBlock = (
	name: string,
	attributes?: Record< string, unknown >,
	innerBlocks?: CreatedBlock[]
) => CreatedBlock;

export function resolveClientId(
	clientId: string | undefined | null,
	reverseMap: Record< string, string >
): string | undefined {
	if ( ! clientId ) {
		return undefined;
	}

	return reverseMap[ clientId ] || clientId;
}

export function normalizeBlockEdits( args: ApplyBlockEditsArgs ): NormalizedBlockEdits {
	const updates = ( args.updates || [] ).filter( Boolean );
	const inserts = ( args.inserts || [] ).filter( Boolean );
	const deletes = ( args.deletes || [] )
		.map( ( item ) => ( typeof item === 'string' ? item : item?.clientId ) )
		.filter( ( clientId ): clientId is string => typeof clientId === 'string' && !! clientId );
	const customCSS = typeof args.customCSS === 'string' ? args.customCSS : undefined;

	if (
		! updates.length &&
		! inserts.length &&
		! deletes.length &&
		typeof customCSS === 'undefined' &&
		! args.summary
	) {
		throw new Error(
			__( 'Apply block edits needs at least one update, insert, delete, or summary.', 'jetpack' )
		);
	}

	return {
		updates,
		inserts,
		deletes,
		customCSS,
		summary: args.summary,
		followUpTasks: args.followUpTasks,
	};
}

// Deep-merges target and source objects. Setting a source key to `null` emits
// `undefined` for that key so shallow-merge consumers like WordPress'
// `updateBlockAttributes` actually overwrite the existing value with an unset
// one (a bare `delete` would leave the old value intact after a spread).
export function mergeBlockAttributes(
	target: unknown,
	source: unknown
): Record< string, unknown > {
	return deepMerge( target, source ) as Record< string, unknown >;
}

function deepMerge( target: unknown, source: unknown ): unknown {
	if ( typeof source === 'undefined' ) {
		return target;
	}

	if ( source === null ) {
		return null;
	}

	if ( target === null || typeof target === 'undefined' ) {
		return source;
	}

	if ( typeof source !== 'object' || Array.isArray( source ) ) {
		return source;
	}

	if ( typeof target !== 'object' || Array.isArray( target ) ) {
		return source;
	}

	const result = { ...( target as Record< string, unknown > ) };
	const sourceRecord = source as Record< string, unknown >;

	for ( const key of Object.keys( sourceRecord ) ) {
		const mergedValue = deepMerge( result[ key ], sourceRecord[ key ] );
		result[ key ] = mergedValue === null ? undefined : mergedValue;
	}

	return result;
}

// Recursively merges new block data onto an existing block, preserving
// properties the new data does not override. `getBlock` is an optional live
// lookup used to resolve inner blocks that a controlled parent (e.g.
// `core/post-content`) reports with an empty local children list.
export function mergeBlocksRecursively(
	originalBlock: EditorBlock | null,
	newBlockData: BlockData,
	reverseMap: Record< string, string >,
	getBlock?: ( clientId: string ) => EditorBlock | null
): BlockData {
	if ( ! originalBlock ) {
		return newBlockData;
	}

	const shouldPreserveAttributes =
		Array.isArray( newBlockData.attributes ) ||
		( typeof newBlockData.attributes === 'object' &&
			newBlockData.attributes !== null &&
			Object.keys( newBlockData.attributes ).length === 0 );

	const mergedBlock: BlockData = {
		...originalBlock,
		...newBlockData,
		name: newBlockData.name || originalBlock.name,
		attributes: shouldPreserveAttributes
			? originalBlock.attributes || {}
			: mergeBlockAttributes( originalBlock.attributes || {}, newBlockData.attributes || {} ),
	};

	if ( Array.isArray( newBlockData.innerBlocks ) ) {
		mergedBlock.innerBlocks = newBlockData.innerBlocks.map( ( newInnerBlock ) => {
			const originalClientId = resolveClientId( newInnerBlock.clientId, reverseMap );
			const originalInnerBlock =
				originalBlock.innerBlocks?.find( ( block ) => block.clientId === originalClientId ) ||
				( originalClientId ? getBlock?.( originalClientId ) ?? null : null );

			// A bare `{ clientId }` reference carries no block data of its own, so
			// it only makes sense as a pointer to an existing block. Fail loudly
			// rather than building a nameless block that later trips the opaque
			// "Cannot create a block without a name." error.
			if ( ! originalInnerBlock && ! newInnerBlock.name ) {
				throw new Error(
					sprintf(
						/* translators: %s is a block client ID. */
						__(
							'Could not resolve existing block "%s" referenced while merging inner blocks.',
							'jetpack'
						),
						String( newInnerBlock.clientId )
					)
				);
			}

			return mergeBlocksRecursively(
				originalInnerBlock || null,
				newInnerBlock,
				reverseMap,
				getBlock
			);
		} );
	} else {
		mergedBlock.innerBlocks = originalBlock.innerBlocks || [];
	}

	return mergedBlock;
}

export function validateBlockData(
	block: BlockData,
	availableBlocks: Set< string >,
	options: { allowClientIdOnly?: boolean } = {}
): void {
	if ( options.allowClientIdOnly && block.clientId && ! block.name ) {
		return;
	}

	if ( ! block.name ) {
		throw new Error( __( 'Block data must include a block name.', 'jetpack' ) );
	}

	if ( ! availableBlocks.has( block.name ) ) {
		throw new Error(
			sprintf(
				/* translators: %s is a block type name, such as core/paragraph. */
				__( 'Block type "%s" is not available.', 'jetpack' ),
				block.name
			)
		);
	}

	if ( block.innerBlocks?.length ) {
		for ( const innerBlock of block.innerBlocks ) {
			validateBlockData( innerBlock, availableBlocks, { allowClientIdOnly: true } );
		}
	}
}

export function validateBlockEdits(
	edits: NormalizedBlockEdits,
	availableBlocks: Set< string >
): void {
	for ( const update of edits.updates ) {
		if ( ! update.clientId ) {
			throw new Error(
				__( 'Updates must include the clientId of the block to update.', 'jetpack' )
			);
		}
		validateBlockData( update, availableBlocks, { allowClientIdOnly: true } );
	}

	for ( const insert of edits.inserts ) {
		if ( ! insert.block?.name ) {
			throw new Error( __( 'Insertions must include block data with a block name.', 'jetpack' ) );
		}
		validateBlockData( insert.block, availableBlocks );
	}
}

export async function createBlockRecursively(
	blockData: BlockData,
	createBlock: CreateBlock
): Promise< CreatedBlock > {
	if ( ! blockData.name ) {
		throw new Error( __( 'Cannot create a block without a name.', 'jetpack' ) );
	}

	const innerBlocks: CreatedBlock[] = Array.isArray( blockData.innerBlocks )
		? await Promise.all(
				blockData.innerBlocks.map( ( inner ) => createBlockRecursively( inner, createBlock ) )
		  )
		: [];

	return createBlock( blockData.name, blockData.attributes || {}, innerBlocks );
}
