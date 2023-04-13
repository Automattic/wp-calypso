import detectFormat from './detect-format';
import Strategies from './strategies';

/**
 * Accepts a node of mixed type, attempts to recursively parse all relevant
 * media metadata, and returns an object including all detected values.
 *
 * @param  {*}      node    Media object to parse
 * @param  {Object} _parsed In recursion, the known values
 * @returns {Object}         Object of all detected values
 */
export function deserialize( node, _parsed ) {
	const format = detectFormat( node );
	return Strategies[ format.toLowerCase() ].deserialize( node, _parsed );
}
