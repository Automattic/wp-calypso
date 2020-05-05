import {
	compact,
	flowRight as compose,
	fromPairs,
	get,
	map,
	matchesProperty,
	reduce,
} from 'lodash';
import { convertFromRaw, convertToRaw } from 'draft-js';

/*
 * The functions in this file convert between the
 * Calypso-native representation of title formats
 * and its translation into the structure for the
 * draft-js editor.
 *
 * Custom block titles consist of a list of zero
 * or more "pieces," each of which is either a
 * predefined "token" or a sequence of arbitrary
 * text.
 *
 * "Tokens" are placeholders for dynamic content
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
 * the token names since that is what it will
 * render to the browser. However, the native name
 * is stored as metadata for the range of characters
 * that represent the token.
 *
 */

/**
 * Converts from ContentState to native Calypso format list
 *
 * Since the editor constrains us to a single block, we can
 * safely assume that we only need to convert the first one
 *
 * @param {ContentState} content Content of editor
 * @returns {Array} title format
 */
export const fromEditor = ( content ) => {
	const rawContent = convertToRaw( content );
	const text = get( rawContent, 'blocks[0].text', '' );
	const ranges = get( rawContent, 'blocks[0].entityRanges', [] );
	const entities = get( rawContent, 'entityMap' );

	// [ output, index, text ]
	const [ o, i, t ] = ranges.reduce(
		( [ output, lastIndex, remainingText ], next ) => {
			const tokenName = get( entities, [ next.key, 'data', 'name' ], null );
			const textBlock =
				next.offset > lastIndex
					? { type: 'string', value: remainingText.slice( lastIndex, next.offset ) }
					: null;

			return [
				[ ...output, textBlock, { type: tokenName } ],
				next.offset + next.length,
				remainingText,
			];
		},
		[ [], 0, text ]
	);

	// add final remaining text not captured by any entity ranges
	return compact( [ ...o, i < t.length && { type: 'string', value: t.slice( i ) } ] );
};

const isTextPiece = matchesProperty( 'type', 'string' );

const emptyBlockMap = {
	text: '',
	entityRanges: [],
	type: 'unstyled',
};

/**
 * Preprocesses token title for display in editor.
 *
 * Explicit spacing is required here in order to make
 * the display of the tokens look right. Simply adding
 * CSS to a trimmed title leads to cursor and spacing
 * inconsistencies.
 *
 * \u205f is a mathematical medium space. A normal space
 * was being trimmed implicitly somewhere in WebKit and
 * raising exceptions and causing visual glitches.
 * See #8047
 *
 * @param {string} title - Token's title
 * @returns string - Processed title
 */
export const mapTokenTitleForEditor = ( title ) => `\u205f\u205f${ title }\u205f\u205f`;

/**
 * Returns the translated name for the chip
 *
 * @param {string} type chip name, e.g. 'siteName'
 * @param {object} tokens available tokens, e.g. { siteName: 'Site Name', tagline: 'Tagline' }
 * @returns {string} translated chip name
 */
const tokenTitle = ( type, tokens ) => mapTokenTitleForEditor( get( tokens, type, '' ).trim() );

/**
 * Creates a new entity reference for a blockMap
 *
 * @param {number} offset start of entity inside of block text
 * @param {string} type token name for entity reference
 * @param {object} tokens mapping between token names and translated titles
 * @param {object} entityGuide mapping between tokens and entity keys
 * @returns {object} entityRange for use in blockMap in ContentState
 */
const newEntityAt = ( offset, type, tokens, entityGuide ) => ( {
	key: entityGuide.length,
	length: tokenTitle( type, tokens ).length,
	offset,
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
 * @param {object} entityGuide mapping between tokens and entity keys
 * @returns {object} blockMap for use in ContentState
 */
const buildBlockMap = compose( ( format, tokens ) =>
	reduce(
		format,
		( [ block, lastIndex, entityGuide ], piece ) => [
			{
				...block,
				entityRanges: isTextPiece( piece )
					? block.entityRanges // text pieces don't add entities
					: [ ...block.entityRanges, newEntityAt( lastIndex, piece.type, tokens, entityGuide ) ],
				text:
					block.text + ( isTextPiece( piece ) ? piece.value : tokenTitle( piece.type, tokens ) ),
			},
			lastIndex + ( piece.value ? piece.value.length : tokenTitle( piece.type, tokens ).length ),
			isTextPiece( piece ) ? entityGuide : [ ...entityGuide, piece.type ],
		],
		[ emptyBlockMap, 0, [] ]
	)
);

/**
 * Converts Calypso-native title format into RawDraftContentState for Editor
 *
 * @param {Array} format pieces used to build title format
 * @param {object} tokens mapping between token names and translated titles
 * @returns {ContentState} content for editor
 */
export const toEditor = ( format, tokens ) => {
	const [ blocks /* lastIndex */, , entityGuide ] = buildBlockMap( format, tokens );

	return convertFromRaw( {
		blocks: [ blocks ],
		entityMap: fromPairs(
			map( entityGuide, ( name, key ) => [
				key, // entity key is position in list
				{
					type: 'TOKEN',
					mutability: 'IMMUTABLE',
					data: { name },
				},
			] )
		),
	} );
};
