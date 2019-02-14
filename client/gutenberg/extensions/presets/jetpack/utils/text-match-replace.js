/**
 * External dependencies
 */
import { isRegExp, escapeRegExp, isString, flatten } from 'lodash';

/**
 * Given a string, replace every substring that is matched by the `match` regex
 * with the result of calling `fn` on matched substring. The result will be an
 * array with all odd indexed elements containing the replacements. The primary
 * use case is similar to using String.prototype.replace except for React.
 *
 * React will happily render an array as children of a react element, which
 * makes this approach very useful for tasks like surrounding certain text
 * within a string with react elements.
 *
 * Example:
 * matchReplace(
 *   'Emphasize all phone numbers like 884-555-4443.',
 *   /([\d|-]+)/g,
 *   (number, i) => <strong key={i}>{number}</strong>
 * );
 * // => ['Emphasize all phone numbers like ', <strong>884-555-4443</strong>, '.'
 *
 * @param {string} text - The text that you want to replace
 * @param {regexp|str} match Must contain a matching group
 * @param {function} fn function that helps replace the matched text
 * @return {array} An array of string or react components
 */
function replaceString( text, match, fn ) {
	let curCharStart = 0;
	let curCharLen = 0;

	if ( text === '' ) {
		return text;
	} else if ( ! text || ! isString( text ) ) {
		throw new TypeError( 'First argument must be a string' );
	}

	let re = match;

	if ( ! isRegExp( re ) ) {
		re = new RegExp( '(' + escapeRegExp( re ) + ')', 'gi' );
	}

	const result = text.split( re );
	// Apply fn to all odd elements
	for ( let i = 1, length = result.length; i < length; i += 2 ) {
		curCharLen = result[ i ].length;
		curCharStart += result[ i - 1 ].length;
		if ( result[ i ] ) {
			result[ i ] = fn( result[ i ], i, curCharStart );
		}
		curCharStart += curCharLen;
	}

	return result;
}

const textMatchReplace = ( source, match, fn ) => {
	if ( ! Array.isArray( source ) ) source = [ source ];

	return flatten(
		source.map( x => {
			return isString( x ) ? replaceString( x, match, fn ) : x;
		} )
	);
};

export default textMatchReplace;
