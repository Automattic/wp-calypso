/** @ssr-ready **/

// Maps between different title format formats
//
// raw is a string like: '%site_name% | %tagline%'
//                        \_________/   \_______/
//                             |            |
//                             \------------\- tags
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
	join,
	map,
	mapKeys,
	mapValues,
	matchesProperty,
	partialRight,
	rearg,
	reject,
	snakeCase,
	split
} from 'lodash';

export const removeBlanks = values => reject( values, matchesProperty( 'value', '' ) );

// %site_name%, %tagline%, etc…
const tagPattern = /(%[a-zA-Z_]+%)/;
const isTag = s => tagPattern.test( s );

const tagToToken = s =>
	isTag( s )
		? { type: camelCase( s.slice( 1, -1 ) ) } // %site_name% -> type: siteName
		: { type: 'string', value: s };           // arbitrary text passes through

const tokenToTag = n =>
	'string' !== n.type
		? `%${ snakeCase( n.type ) }%` // siteName -> %site_name%
		: n.value;                     // arbitrary text passes through

export const rawToNative = r => removeBlanks( map( split( r, tagPattern ), tagToToken ) );
export const nativeToRaw = n => join( map( n, tokenToTag ), '' );

// Not only are the format strings themselves stored differently
// than on the server, but the API expects a different structure
// for the data mapping the types to the formats, so we additionally
// need to perform a mapping stage when talking with it, iterating
// over the full data structure and not just focusing on individual
// title format strings.
//
//  - Rename keys: `front_page` -> `frontPage`
//  - Translate formats: `%page_title%` -> [ { type: 'pageTitle' } ]

export const toApi = compose(
	partialRight( mapKeys, rearg( snakeCase, 1 ) ), // 1 -> key from ( value, key )
	partialRight( mapValues, nativeToRaw )          // native objects to raw strings
);

export const fromApi = compose(
	partialRight( mapKeys, rearg( camelCase, 1 ) ), // 1 -> key from ( value, key )
	partialRight( mapValues, rawToNative )          // raw strings to native objects
);
