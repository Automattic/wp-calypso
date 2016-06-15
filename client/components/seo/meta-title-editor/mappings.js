// Maps between different title format formats
//
// raw is a string like: '%site_name% | %tagline%'
//                        \_________/   \_______/
//                             |            |
//                             \------------\- tokens
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
import snakeCase from 'lodash/snakeCase';
import split from 'lodash/split';

export const removeBlanks = l => l.filter( ( { value } ) => '' !== value );

const placeholderPattern = /(%[a-zA-Z_]+%)/;
const isPlaceholder = s => placeholderPattern.test( s );

const placeholderToTag = p =>
	isPlaceholder( p )
		? { type: camelCase( p.slice( 1, -1 ) ) }
		: { value: p, type: 'string' };

const tagToPlaceholder = n => 'string' === n.type ? n.value : `%${ snakeCase( n.type ) }%`;

export const rawToNative = r => removeBlanks( map( split( r, placeholderPattern ), placeholderToTag ) );
export const nativeToRaw = n => join( map( n, tagToPlaceholder ), '' );
