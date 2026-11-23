import { parse } from '@wordpress/blocks';
import { select } from '@wordpress/data';
import { isRecord } from '../utils/is-record';
import {
	APPLY_BLOCK_EDITS_ABILITY_NAME,
	EDIT_ENTITY_RECORD_ABILITY_NAME,
	SHOW_TEMPLATE_ABILITY_NAME,
} from './contracts';
import type { Block } from '@wordpress/blocks';

const EDITABLE_POST_TYPES = [ 'post', 'page' ];
const EDITABLE_POST_FIELDS = [ 'title', 'excerpt' ];

export type ToolCallContext = {
	knownBlockClientIds: Set< string >;
};

export function rememberBlockClientIds( result: unknown, context: ToolCallContext ): void {
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
	context: ToolCallContext
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

/**
 * Targets the open post, so the WebMCP tool can never reach the full ability's
 * creates, deletes and site-wide edits.
 */
function prepareEditEntityRecordInput(
	input: Record< string, unknown >
): Record< string, unknown > {
	const editor = select( 'core/editor' ) as
		| {
				getCurrentPostType?: () => string | undefined;
				getCurrentPostId?: () => number | string | undefined;
		  }
		| undefined;
	const postType = editor?.getCurrentPostType?.();
	const postId = editor?.getCurrentPostId?.();

	if ( ! postType || ! EDITABLE_POST_TYPES.includes( postType ) || postId == null ) {
		throw new Error( 'The editor does not have a post or page open.' );
	}

	const unknownFields = Object.keys( input ).filter(
		( key ) => ! EDITABLE_POST_FIELDS.includes( key )
	);

	if ( unknownFields.length ) {
		throw new Error(
			`Unknown field: ${ unknownFields.join( ', ' ) }. Use title and excerpt only.`
		);
	}

	const record = Object.fromEntries(
		Object.entries( input ).filter( ( [ , value ] ) => typeof value === 'string' )
	);

	if ( Object.keys( record ).length !== Object.keys( input ).length ) {
		throw new Error( 'title and excerpt must be strings.' );
	}

	if ( ! Object.keys( record ).length ) {
		throw new Error( 'Provide a title or an excerpt.' );
	}

	return {
		editEntities: [ { entityType: 'postType', entityName: postType, recordId: postId, record } ],
	};
}

export function prepareToolInput(
	abilityName: string,
	input: Record< string, unknown >,
	context: ToolCallContext
): Record< string, unknown > {
	if ( abilityName === APPLY_BLOCK_EDITS_ABILITY_NAME ) {
		return prepareApplyBlockEditsInput( input, context );
	}

	if ( abilityName === EDIT_ENTITY_RECORD_ABILITY_NAME ) {
		return prepareEditEntityRecordInput( input );
	}

	return input;
}

/**
 * Points `show-template`'s Big Sky next step at the WebMCP block-tree tool.
 */
export function adaptToolResult( abilityName: string, result: unknown ): unknown {
	return abilityName === SHOW_TEMPLATE_ABILITY_NAME ? toWebMcpToolNames( result ) : result;
}

function toWebMcpToolNames( value: unknown ): unknown {
	if ( typeof value === 'string' ) {
		return value.replaceAll( 'big_sky__get_page_structure', 'agents_manager__get_block_tree' );
	}

	if ( Array.isArray( value ) ) {
		return value.map( toWebMcpToolNames );
	}

	if ( isRecord( value ) ) {
		return Object.fromEntries(
			Object.entries( value ).map( ( [ key, item ] ) => [ key, toWebMcpToolNames( item ) ] )
		);
	}

	return value;
}
