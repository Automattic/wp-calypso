// Maps between different title format formats
//
// raw from API is
// {
// 	"advanced_seo_title_formats": {
// 		"pages": [
// 			{ "type": "token", "value": "page_title" },
// 			{ "type": "string", "value": " is awesome!" }
// 		],
// 		"posts": [
// 			{ "type": "token", "value": "post_title" },
// 			{ "type": "string", "value": " | " },
// 			{ "type": "token", "value": "site_name" }
// 		],
// 	}
// }
//
// native is an array of plain-text strings and tokens
//   [ { type: 'postTitle' }, { type: 'string', value: ' on ' }, { type: 'siteName' } ]
//     \___________________/                                     \__________________/
//               |                                                  |
//               \--------------------------------------------------\--- tokens
//
//   @see README for `TokenField`
//   [
//   	{ value: 'Site Name', type: 'siteName' },
//   	{ value: ' | ', type: 'string' },
//   	{ value: 'Post Title', type: 'postTitle' }
//   ]
//

/**
 * External dependencies
 */
import {
	camelCase,
	flowRight as compose,
	get,
	initial,
	last,
	map,
	mapKeys,
	mapValues,
	partialRight,
	rearg,
	reduce,
	snakeCase,
	unary,
} from 'lodash';

const mergeStringPieces = ( a, b ) => ( {
	type: 'string',
	value: a.value + b.value,
} );

/**
 * Converts an individual title format
 * from the API representation to a
 * Calypso-native format
 *
 * @param {Array} r List of raw format pieces
 * @returns {Array} List of native format pieces
 */
export const rawToNative = unary(
	partialRight( map, ( p ) =>
		Object.assign(
			{},
			{ type: 'string' === p.type ? 'string' : camelCase( p.value ) },
			'string' === p.type && { value: p.value }
		)
	)
);

/**
 * Converts an individual title format
 * from the Calypso-native representation
 * to a Calypso-native format
 *
 * @param {Array} n List of native format pieces
 * @returns {Array} List of raw format pieces
 */
export const nativeToRaw = unary(
	compose(
		// combine adjacent strings
		partialRight(
			reduce,
			( format, piece ) => {
				const lastPiece = last( format );

				if ( lastPiece && 'string' === lastPiece.type && 'string' === piece.type ) {
					return [ ...initial( format ), mergeStringPieces( lastPiece, piece ) ];
				}

				return [ ...format, piece ];
			},
			[]
		),
		partialRight( map, ( p ) => ( {
			type: p.type === 'string' ? 'string' : 'token',
			value: get( p, 'value', snakeCase( p.type ) ),
		} ) )
	)
);

// Not only are the format strings themselves stored differently
// than on the server, but the API expects a different structure
// for the data mapping the types to the formats, so we additionally
// need to perform a mapping stage when talking with it, iterating
// over the full data structure and not just focusing on individual
// title format strings.
//
//  - Rename keys: `front_page` -> `frontPage`
//  - Translate formats: see above

export const toApi = compose(
	partialRight( mapKeys, rearg( snakeCase, 1 ) ), // 1 -> key from ( value, key )
	partialRight( mapValues, nativeToRaw ) // native objects to raw objects
);

export const fromApi = compose(
	partialRight( mapKeys, rearg( camelCase, 1 ) ), // 1 -> key from ( value, key )
	partialRight( mapValues, rawToNative ) // raw objects to native objects
);
