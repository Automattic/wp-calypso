/**
 * What the agent learns about an apply beyond "done": which targets it named
 * exist, whether each delete and attribute write took, and how many blocks
 * changed. Compact on purpose, so the agent can tell applied from verified
 * without the page's block JSON.
 */

import { getBlockTypes } from '@wordpress/blocks';
import { getBlock } from '../../utils/editor-blocks';
import { isRecord } from '../../utils/is-record';
import type { BlockEdits, ResolveClientId } from './types';
import type { EditorBlock, PageBlocks } from '../../utils/editor-blocks';

const MAX_ITEMS = 10;
const MAX_STRING_LENGTH = 300;

type BlockSnapshot = Pick< EditorBlock, 'clientId' | 'name' | 'attributes' >;

/** A target as it was before the edits applied, keyed by the id the agent sent. */
interface CapturedTarget {
	resolvedClientId: string;
	beforeBlock?: BlockSnapshot;
}

interface AppliedOperations {
	addedCount: number;
	removedCount: number;
	modifiedCount: number;
}

interface UnresolvedTarget {
	operation: 'update' | 'delete';
	requestedClientId: string;
	resolvedClientId?: string;
	reason: 'not-found';
}

interface DeleteResult {
	requestedClientId: string;
	resolvedClientId: string;
	blockName?: string;
	status: 'unresolved' | 'still-present' | 'removed';
}

interface AttributeResult {
	blockName: string;
	requestedClientId: string;
	resolvedClientId: string;
	path: string;
	requested: unknown;
	before: unknown;
	after: unknown;
	status:
		| 'unresolved'
		| 'missing-after-apply'
		| 'unchanged'
		| 'mismatch'
		| 'already-satisfied'
		| 'changed';
}

interface UnsupportedAttribute {
	blockName: string;
	requestedClientId: string;
	path: string;
	reason: 'not-registered-attribute';
}

type ValidationDetails = {
	appliedOperations: AppliedOperations;
	unresolvedTargets?: UnresolvedTarget[];
	deleteResults?: DeleteResult[];
	attributeResults?: AttributeResult[];
	unsupportedAttributes?: UnsupportedAttribute[];
	contentTextSnapshot?: string;
};

type BlocksByClientId = Map< string, BlockSnapshot >;

const isObject = ( value: unknown ): value is Record< string, unknown > =>
	typeof value === 'object' && value !== null;

const truncate = ( value: string ): string =>
	value.length > MAX_STRING_LENGTH ? `${ value.slice( 0, MAX_STRING_LENGTH ) }…` : value;

const normalizeValue = ( value: unknown ): unknown => {
	if ( value === undefined ) {
		return null;
	}

	return typeof value === 'string' ? truncate( value ) : value;
};

const sameValue = ( a: unknown, b: unknown ): boolean =>
	JSON.stringify( a ?? null ) === JSON.stringify( b ?? null );

// Key order aside, whether the two differ anywhere: objects and arrays by key, the rest by JSON.
function valuesDiffer( a: unknown, b: unknown ): boolean {
	if ( ! isObject( a ) || ! isObject( b ) ) {
		return JSON.stringify( a ) !== JSON.stringify( b );
	}

	return (
		Object.keys( a ).some( ( key ) => ! ( key in b ) || valuesDiffer( a[ key ], b[ key ] ) ) ||
		Object.keys( b ).some( ( key ) => ! ( key in a ) )
	);
}

const getNestedValue = ( source: unknown, path: string[] ): unknown =>
	path.reduce< unknown >(
		( value, key ) => ( isObject( value ) ? value[ key ] : undefined ),
		source
	);

// Every leaf of a requested attributes object, with the path that reaches it.
function collectAttributePaths(
	attributes: unknown,
	path: string[] = []
): { path: string[]; requested: unknown }[] {
	if ( isRecord( attributes ) ) {
		return Object.entries( attributes ).flatMap( ( [ key, value ] ) =>
			collectAttributePaths( value, [ ...path, key ] )
		);
	}

	return [ { path, requested: attributes } ];
}

const snapshotBlock = ( { clientId, name, attributes }: EditorBlock ): BlockSnapshot => ( {
	clientId,
	name,
	attributes: JSON.parse( JSON.stringify( attributes ) ),
} );

const getRootLists = ( page: PageBlocks ): EditorBlock[][] => [
	page.blocks,
	...page.templateParts.map( ( part ) => part.blocks ),
];

function flattenPage( page: PageBlocks ): Map< string, EditorBlock > {
	const byClientId = new Map< string, EditorBlock >();
	const add = ( block: EditorBlock ): void => {
		if ( ! byClientId.has( block.clientId ) ) {
			byClientId.set( block.clientId, block );
		}

		block.innerBlocks.forEach( add );
	};

	getRootLists( page ).forEach( ( blocks ) => blocks.forEach( add ) );

	return byClientId;
}

const getRootOrder = ( page: PageBlocks ): string[][] =>
	getRootLists( page ).map( ( blocks ) => blocks.map( ( block ) => block.clientId ) );

// Counts over the page's own lists, before the captured targets fill the maps in.
function countAppliedOperations(
	before: PageBlocks,
	after: PageBlocks,
	previous: BlocksByClientId,
	current: BlocksByClientId
): AppliedOperations {
	const addedCount = Array.from( current.keys() ).filter( ( id ) => ! previous.has( id ) ).length;
	const removedCount = Array.from( previous.keys() ).filter( ( id ) => ! current.has( id ) ).length;
	const modifiedCount = Array.from( current.values() ).filter( ( block ) => {
		const previousBlock = previous.get( block.clientId );

		return previousBlock && valuesDiffer( previousBlock, block );
	} ).length;

	// Root sibling order is no block's own, so a bare reorder counts as one modification.
	const isRootReorder =
		! addedCount &&
		! removedCount &&
		! modifiedCount &&
		JSON.stringify( getRootOrder( before ) ) !== JSON.stringify( getRootOrder( after ) );

	return { addedCount, removedCount, modifiedCount: isRootReorder ? 1 : modifiedCount };
}

// A target outside the page's roots, or replaced under a new clientId, is known
// only from its capture and from the editor: fill it in where the page's own
// lists say nothing.
function addCapturedTargets(
	capturedTargets: Map< string, CapturedTarget >,
	resolve: ResolveClientId,
	previous: BlocksByClientId,
	current: BlocksByClientId
): void {
	capturedTargets.forEach( ( { beforeBlock }, requestedId ) => {
		const clientId = resolve( requestedId );

		if ( beforeBlock && ! previous.has( clientId ) ) {
			previous.set( clientId, beforeBlock );
		}

		if ( ! current.has( clientId ) ) {
			const afterBlock = getBlock( clientId );

			if ( afterBlock ) {
				current.set( clientId, afterBlock );
			}
		}
	} );
}

function getUnresolvedTargets(
	edits: BlockEdits,
	capturedTargets: Map< string, CapturedTarget >,
	recoveredTargetIds: Set< string >
): UnresolvedTarget[] {
	const requested: [ UnresolvedTarget[ 'operation' ], string ][] = [
		...edits.updates
			.slice( 0, MAX_ITEMS )
			.map( ( update ): [ 'update', string ] => [ 'update', update.clientId ] ),
		...edits.deletes.slice( 0, MAX_ITEMS ).map( ( id ): [ 'delete', string ] => [ 'delete', id ] ),
	];

	return requested
		.flatMap( ( [ operation, requestedClientId ] ): UnresolvedTarget[] => {
			const target = capturedTargets.get( requestedClientId );
			// An unmapped-parent reorder recovery applied this update without
			// its target: reporting it unresolved would contradict the success
			// and invite a pointless retry. A delete of the same id keeps its entry.
			const recovered = operation === 'update' && recoveredTargetIds.has( requestedClientId );

			if ( target?.beforeBlock || recovered ) {
				return [];
			}

			return [
				{
					operation,
					requestedClientId,
					resolvedClientId: target?.resolvedClientId,
					reason: 'not-found',
				},
			];
		} )
		.slice( 0, MAX_ITEMS );
}

function getDeleteStatus(
	before: BlockSnapshot | undefined,
	after: BlockSnapshot | undefined
): DeleteResult[ 'status' ] {
	if ( ! before && ! after ) {
		return 'unresolved';
	}

	return after ? 'still-present' : 'removed';
}

const getDeleteResults = (
	edits: BlockEdits,
	resolve: ResolveClientId,
	previous: BlocksByClientId,
	current: BlocksByClientId
): DeleteResult[] =>
	edits.deletes.slice( 0, MAX_ITEMS ).map( ( requestedClientId ) => {
		const resolvedClientId = resolve( requestedClientId );
		const before = previous.get( resolvedClientId );
		const after = current.get( resolvedClientId );

		return {
			requestedClientId,
			resolvedClientId,
			blockName: before?.name || after?.name,
			status: getDeleteStatus( before, after ),
		};
	} );

function getAttributeStatus(
	before: BlockSnapshot | undefined,
	after: BlockSnapshot | undefined,
	satisfied: boolean,
	unchanged: boolean
): AttributeResult[ 'status' ] {
	if ( ! before && ! after ) {
		return 'unresolved';
	}

	if ( ! after ) {
		return 'missing-after-apply';
	}

	if ( satisfied ) {
		return unchanged ? 'already-satisfied' : 'changed';
	}

	return unchanged ? 'unchanged' : 'mismatch';
}

const getAttributeResults = (
	edits: BlockEdits,
	resolve: ResolveClientId,
	previous: BlocksByClientId,
	current: BlocksByClientId
): AttributeResult[] =>
	edits.updates
		.flatMap( ( update ) => {
			const resolvedClientId = resolve( update.clientId );
			const before = previous.get( resolvedClientId );
			const after = current.get( resolvedClientId );

			return collectAttributePaths( update.attributes || {} ).map( ( { path, requested } ) => {
				const beforeValue = getNestedValue( before?.attributes, path );
				const afterValue = getNestedValue( after?.attributes, path );

				return {
					blockName: update.name,
					requestedClientId: update.clientId,
					resolvedClientId,
					path: path.join( '.' ),
					requested: normalizeValue( requested ),
					before: normalizeValue( beforeValue ),
					after: normalizeValue( afterValue ),
					status: getAttributeStatus(
						before,
						after,
						sameValue( requested, afterValue ),
						sameValue( beforeValue, afterValue )
					),
				};
			} );
		} )
		.slice( 0, MAX_ITEMS );

function getUnsupportedAttributes( edits: BlockEdits ): UnsupportedAttribute[] {
	const schemaByName = new Map(
		getBlockTypes().map( ( blockType ) => [ blockType.name, blockType.attributes ] )
	);

	return edits.updates
		.flatMap( ( update ) => {
			const schema = schemaByName.get( update.name );

			if ( ! schema || ! update.attributes ) {
				return [];
			}

			return Object.keys( update.attributes )
				.filter( ( path ) => ! Object.hasOwn( schema, path ) )
				.map( ( path ): UnsupportedAttribute => ( {
					blockName: update.name,
					requestedClientId: update.clientId,
					path,
					reason: 'not-registered-attribute',
				} ) );
		} )
		.slice( 0, MAX_ITEMS );
}

// The page's text after a content edit or an insert, tags stripped, for the
// agent to read the result back without the blocks.
function getContentTextSnapshot(
	edits: BlockEdits,
	current: BlocksByClientId
): string | undefined {
	const hasContentEdit = edits.updates.some(
		( update ) => update.attributes?.content !== undefined
	);

	if ( ! hasContentEdit && ! edits.inserts.length ) {
		return undefined;
	}

	const text = Array.from( current.values() )
		.map( ( block ) => block.attributes.content )
		.filter( ( content ): content is string => typeof content === 'string' )
		.join( ' ' )
		.replace( /<[^>]*>/g, ' ' )
		.replace( /\s+/g, ' ' )
		.trim();

	return text ? truncate( text ) : undefined;
}

/** Every update and delete target as it stands now, to be taken before the edits apply. */
export function captureTargets(
	edits: BlockEdits,
	resolve: ResolveClientId
): Map< string, CapturedTarget > {
	const targets = new Map< string, CapturedTarget >();
	const requestedIds = [ ...edits.updates.map( ( update ) => update.clientId ), ...edits.deletes ];

	requestedIds.forEach( ( requestedId ) => {
		const resolvedClientId = resolve( requestedId );
		const block = getBlock( resolvedClientId );

		targets.set( requestedId, {
			resolvedClientId,
			...( block && { beforeBlock: snapshotBlock( block ) } ),
		} );
	} );

	return targets;
}

/** Whether the page's blocks differ at all between the two states. */
export const haveBlocksChanged = ( before: PageBlocks, after: PageBlocks ): boolean =>
	JSON.stringify( before ) !== JSON.stringify( after );

/** The post-apply summary for the agent: lists capped at 10 entries, strings at 300 characters. */
export function getValidationDetails( {
	edits,
	resolve,
	before,
	after,
	capturedTargets,
	recoveredTargetIds,
}: {
	edits: BlockEdits;
	resolve: ResolveClientId;
	before: PageBlocks;
	after: PageBlocks;
	capturedTargets: Map< string, CapturedTarget >;
	recoveredTargetIds: Set< string >;
} ): ValidationDetails {
	const previous: BlocksByClientId = flattenPage( before );
	const current: BlocksByClientId = flattenPage( after );
	const appliedOperations = countAppliedOperations( before, after, previous, current );

	addCapturedTargets( capturedTargets, resolve, previous, current );

	const unresolvedTargets = getUnresolvedTargets( edits, capturedTargets, recoveredTargetIds );
	const deleteResults = getDeleteResults( edits, resolve, previous, current );
	const attributeResults = getAttributeResults( edits, resolve, previous, current );
	const unsupportedAttributes = getUnsupportedAttributes( edits );
	const contentTextSnapshot = getContentTextSnapshot( edits, current );

	return {
		appliedOperations,
		...( unresolvedTargets.length && { unresolvedTargets } ),
		...( deleteResults.length && { deleteResults } ),
		...( attributeResults.length && { attributeResults } ),
		...( unsupportedAttributes.length && { unsupportedAttributes } ),
		...( contentTextSnapshot && { contentTextSnapshot } ),
	};
}

/** The clientIds of the updated blocks, as a crop hint for a canvas capture. */
export function getEditedClientIds( edits: BlockEdits, resolve: ResolveClientId ): string[] {
	const clientIds = edits.updates
		.map( ( update ) => resolve( update.clientId ) )
		.filter( ( clientId ) => getBlock( clientId ) );

	return Array.from( new Set( clientIds ) );
}
