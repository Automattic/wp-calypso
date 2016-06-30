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

import camelCase from 'lodash/camelCase';
import join from 'lodash/join';
import map from 'lodash/map';
import matchesProperty from 'lodash/matchesProperty';
import reject from 'lodash/reject';
import snakeCase from 'lodash/snakeCase';
import split from 'lodash/split';

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
