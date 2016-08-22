import {
	compact,
	flowRight as compose,
	get,
	has,
	head,
	invert,
	mapValues,
	matchesProperty,
	reduce,
	some,
} from 'lodash';

const or = ( ...args ) => some( args );

/**
 * Converts from ContentState to native Calypso format list
 *
 * @param {ContentState} rawContent Content of editor
 * @returns {Array} title format
 */
export const fromEditor = rawContent => {
	const text = get( rawContent, 'blocks[0].text', '' );
	const ranges = get( rawContent, 'blocks[0].entityRanges', [] );
	const entities = get( rawContent, 'entityMap' );

	const [ o, i, t ] = ranges.reduce( ( [ output, lastIndex, remainingText ], next ) => {
		const tokenName = get( entities, [ next.key, 'data', 'name' ], null );
		const textBlock = next.offset > lastIndex
			? { type: 'string', value: remainingText.slice( lastIndex, next.offset ) }
			: null;

		return [ [
			...output,
			textBlock,
			{ type: tokenName }
		], next.offset + next.length, remainingText ];
	}, [ [], 0, text ] );

	// add final remaining text not captured by any entity ranges
	return compact( [
		...o,
		i < t.length && { type: 'string', value: t.slice( i ) }
	] );
};

const isTextPiece = matchesProperty( 'type', 'string' );

/**
 * Creates a dictionary for building an entityMap from a given title format
 *
 * There should only be a single entity for each given type of token
 * available in the editor, and only one for each in the given title
 * formats. Therefore, we need to build this dictionary, or mapping,
 * in order to use later when actually creating the entityMap
 *
 * E.g.
 *     From: [
 *         { type: 'string', value: 'Visit ' },
 *         { type: 'siteName' },
 *         { type: 'string', value: ' | ' },
 *         { type: 'tagline' }
 *     ]
 *     To:   { siteName: 0, tagline: 1 }
 *
 * @param {object} format native title format object
 * @returns {object} mapping from token name to presumptive entity id
 */
const buildEntityMapping = compose(
	head, // return only the mapping and discard the lastKey
	format => reduce( format, ( [ entityMap, lastKey ], { type } ) => (
		or( isTextPiece( { type } ), has( entityMap, type ) ) // skip strings and existing tokens
			? [ entityMap, lastKey ]
			: [ { ...entityMap, [ type ]: lastKey }, lastKey + 1 ]
	), [ {}, 0 ] )
);

const emptyBlockMap = {
	text: '',
	entityRanges: [],
	type: 'unstyled'
};

const tokenTitle = ( type, tokens ) => get( tokens, type, '' );

/**
 * Creates a new entity reference for a blockMap
 *
 * @param {Number} offset offset of entity into block text
 * @param {String} type token name for entity reference
 * @param {object} tokens mapping between token names and translated titles
 * @param {object} entityGuide mapping between token names and entity key
 * @returns {object} entityRange for use in blockMap in ContentState
 */
const newEntityAt = ( offset, type, tokens, entityGuide ) => ( {
	key: entityGuide[ type ],
	length: tokenTitle( type, tokens ).length,
	offset
} );

/**
 * Converts native format object to block map
 *
 * E.g.
 *     From: [
 *         { type: 'siteName' },
 *         { type: 'string', value: ' | ' },
 *         { type: 'tagline' }
 *     ]
 *     To: {
 *         text: 'siteName | tagline',
 *         entityRanges: [
 *             { key: 0, offset: 0, length: 8 },
 *             { key: 1, offset: 11, length: 7 }
 *         ]
 *     }
 *
 * @param {Array} format native Calypso title format object
 * @param {object} tokens mapping between token names and translated titles
 * @param {object} entityGuide mapping between token names and entity key
 * @returns {object} blockMap for use in ContentState
 */
const buildBlockMap = compose(
	head,
	( format, tokens, entityGuide ) => reduce( format, ( [ block, lastIndex ], piece ) => [
		{
			...block,
			entityRanges: isTextPiece( piece )
				? block.entityRanges
				: [ ...block.entityRanges, newEntityAt( lastIndex, piece.type, tokens, entityGuide ) ],
			text: block.text + ( isTextPiece( piece ) ? piece.value : tokenTitle( piece.type, tokens ) ),
		},
		lastIndex + ( piece.value ? piece.value.length : tokenTitle( piece.type, tokens ).length )
	], [ emptyBlockMap, 0 ] )
);

/**
 * Converts Calypso-native title format into RawDraftContentState for Editor
 *
 * @param {Array} format pieces used to build title format
 * @param {object} tokens mapping between token names and translated titles
 * @returns {RawDraftContentState} content for editor
 */
export const toEditor = ( format, tokens ) => {
	const entityGuide = buildEntityMapping( format );
	const blocks = [ buildBlockMap( format, tokens, entityGuide ) ];

	return {
		blocks,
		entityMap: mapValues( invert( entityGuide ), name => ( {
			type: 'TOKEN',
			mutability: 'IMMUTABLE',
			data: { name }
		} ) )
	};
};
