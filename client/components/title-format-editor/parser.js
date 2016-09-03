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
import {
	convertFromRaw,
	convertToRaw,
} from 'draft-js';

/*
 * The functions in this file convert between the
 * Calypso-native representation of title formats
 * and its translation into the structure for the
 * draft-js editor.
 *
 * Custom block titles consist of a list of zero
 * or more "pieces," each of which is either a
 * predefined "chip" or a sequence of arbitrary
 * text.
 *
 * "Chips" are placeholders for dynamic content
 * replaced at runtime, such as a site's name or
 * a post's title.
 *
 * <Calypso-native title format>
 * [
 *   { type: 'postTitle' },
 *   { type: 'string', value: ' | ' },
 *   { type: 'siteName' }
 * ]
 *
 * The draft-js editor however operates on a list
 * of blocks containing plain-text and associated
 * meta information about the characters within
 * each block. It is domain-specific to rich text
 * and not to our problems at hand. We must map
 * the title formats into something the editor can
 * use to render and edit them. See the draft-js
 * documentation for understanding its data model.
 *
 * draft-js translation of above example
 * (some data omitted to clarify the example)
 *
 * <RawDraftContentState>
 * {
 *   blocks: [
 *     0: {
 *       text: 'Post Title | Site Name',
 *       type: 'unstyled',
 *       entityRanges: [
 *         { key: 0, offset: 0, length: 10 },
 *         { key: 1, offset: 13, length: 9 }
 *       ]
 *     }
 *   ],
 *   entityMap: {
 *     0: { type: 'TOKEN', mutability: 'IMMUTABLE', data: { name: 'postTitle' } },
 *     1: { type: 'TOKEN', mutability: 'IMMUTABLE', data: { name: 'siteName' } }
 *   }
 * }
 *
 * The challenge then is to provide an effective
 * mapping between these formats. Notice that in
 * the editor we are showing the translations of
 * the chip names since that is what it will
 * render to the browser. However, the native name
 * is stored as metadata for the range of characters
 * that represent the chip.
 *
 */

/**
 * Returns whether or not at least one arg is truthy
 *
 * @param {bool} args pieces to 'or' together
 * @returns {bool} result of 'or'ing all the args
 */
const or = ( ...args ) => some( args );

/**
 * Converts from ContentState to native Calypso format list
 *
 * Since the editor constrains us to a single block, we can
 * safely assume that we only need to convert the first one
 *
 * @param {ContentState} content Content of editor
 * @returns {Array} title format
 */
export const fromEditor = content => {
	const rawContent = convertToRaw( content );
	const text = get( rawContent, 'blocks[0].text', '' );
	const ranges = get( rawContent, 'blocks[0].entityRanges', [] );
	const entities = get( rawContent, 'entityMap' );

	// [ output, index, text ]
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
 * Basically, this finds the set of unique chip tokens in the list
 * and assigns each one an index that increases monotonically.
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
		or(
			isTextPiece( { type } ), // text pieces don't get entities
			has( entityMap, type ) // repeat-tokens don't need new entities
		)
			? [ entityMap, lastKey ] // no changes
			: [ { ...entityMap, [ type ]: lastKey }, lastKey + 1 ] // create the new entity
	), [ {}, 0 ] )
);

const emptyBlockMap = {
	text: '',
	entityRanges: [],
	type: 'unstyled'
};

/**
 * Returns the translated name for the chip
 *
 * @param {string} type chip name, e.g. 'siteName'
 * @param {object} tokens available tokens, e.g. { siteName: 'Site Name', tagline: 'Tagline' }
 * @returns {string} translated chip name
 */
const tokenTitle = ( type, tokens ) => get( tokens, type, '' );

/**
 * Creates a new entity reference for a blockMap
 *
 * @param {Number} offset start of entity inside of block text
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
	head, // return only the block map and discard the lastIndex
	( format, tokens, entityGuide ) => reduce( format, ( [ block, lastIndex ], piece ) => [
		{
			...block,
			entityRanges: isTextPiece( piece )
				? block.entityRanges // text pieces don't add entities
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
 * @returns {ContentState} content for editor
 */
export const toEditor = ( format, tokens ) => {
	const entityGuide = buildEntityMapping( format );
	const blocks = [ buildBlockMap( format, tokens, entityGuide ) ];

	return convertFromRaw( {
		blocks,
		entityMap: mapValues( invert( entityGuide ), name => ( {
			type: 'TOKEN',
			mutability: 'IMMUTABLE',
			data: { name }
		} ) )
	} );
};
