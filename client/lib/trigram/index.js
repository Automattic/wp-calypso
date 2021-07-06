/**
 * External dependencies
 */
import LRU from 'lru';

/**
 * Convert a string into a list of trigrams. A trigram is a 3 character substring.
 * We use a special token for the beginning and the end of the string.
 *
 * Example: trigrams("Hello") = [ "_BEGIN_He", "Hel", "ell", "llo", "lo_END_" ]
 *
 * @param {string} str A string to convert to trigrams.
 * @returns {Array} A List of trigrams.
 */
export function trigrams( str ) {
	const n = 3;
	const grams = [];
	const input = [ '_BEGIN_', ...str.split( '' ), '_END_' ];
	for ( let i = 0; i <= input.length - n; i++ ) {
		grams.push( input.slice( i, i + n ).join( '' ) );
	}
	return grams;
}

/**
 * Convert a list of trigrams into a lookup table.
 * The keys are trigrams, the values are counts.
 *
 * Example: "mississippi"
 * grams_to_lookup([ "_BEGIN_mi", "mis", "iss", "ssi", "sis", "iss", "ssi", "sip", "ipp", "ppi", "pi_END_" ]) =
 *     { "_BEGIN_mi": 1, "mis": 1, "iss": 2, "ssi": 2, "sis": 1, "sip": 1, "ipp": 1, "ppi": 1, "pi_END_": 1 }
 *
 * @param {string} gram_list A list of trigrams, like [ "_BEGIN_He", "Hel", "ell", "llo", "lo_END_" ]
 * @returns {object} A lookup table of trigram frequency.
 */
const grams_to_lookup = ( gram_list ) => {
	const lookup = {};
	for ( const gram of gram_list ) {
		if ( gram in lookup ) {
			lookup[ gram ] += 1;
		} else {
			lookup[ gram ] = 1;
		}
	}
	return lookup;
};

/**
 * Convert a trigram lookup table into a real number magnitude, (aka l2 norm or
 * euclidean distance).  Think of each trigram lookup table as a vector, where
 * there are ~26 * 26 * 26 dimensions ("aaa" ... "zzz")
 *
 * Example:
 * lookup_to_magnitude(grams_to_lookup('hi')) = 1.414215... (sqrt of 2)
 *
 * @param {object} lookup A lookup table of trigram frequency.
 * @returns {number} Magnitude of the vector
 */
const lookup_to_magnitude = ( lookup ) => {
	if ( ! lookup || Object.keys( lookup ).length === 0 ) {
		return 0;
	}
	return Math.sqrt(
		Object.values( lookup )
			.map( ( x ) => x * x )
			.reduce( ( a, b ) => a + b )
	);
};

const string_to_lookup_cache = new LRU( {
	max: 5000,
	maxAge: 1 * 60 * 60 * 1000, // 1 hour in milliseconds
} );

/**
 * Cached: Convert a string to a lookup table of trigram frequency.
 *
 * It's the same as calling grams_to_lookup( trigrams( str ) ), but
 * it caches all calculations it does to find them again quickly.
 *
 * @param str A string to convert to a lookup table of trigram frequency.
 * @returns {str} lookup A lookup table of trigram frequency.
 */
const string_to_lookup = ( str ) => {
	const cache_answer = string_to_lookup_cache.get( str );
	if ( cache_answer !== undefined ) {
		return cache_answer;
	}

	const answer = grams_to_lookup( trigrams( str ) );
	string_to_lookup_cache.set( str, answer );
	return answer;
};

/**
 * Finds the dot product of two lookup tables of trigram frequency.
 *
 * @param {object} lookup1 Lookup table of trigram frequency.
 * @param {object} lookup2 Lookup table of trigram frequency.
 * @returns {number} Dot product.
 */
const dot_product = ( lookup1, lookup2 ) => {
	let value = 0;
	for ( const key of Object.keys( lookup1 ) ) {
		if ( key in lookup2 ) {
			value += lookup1[ key ] * lookup2[ key ];
		}
	}
	return value;
};

/**
 * Finds the cosine similarity of two strings.
 *
 * Conceptually, convert each string to a lookup table of trigram frequencies.
 * Think of the lookup table as a vector in a ~26 * 26 * 26 dimensional space
 * ("aaa" ... "zzz"), then we measure the angle between the vectors, and take
 * the cosine of that angle.
 *
 * @param {str} str1 First string to compare
 * @param {str} str2 Second string to compare
 * @returns {number} Range 0-1. 1 = Exact same string, 0 = no similiarity.
 * In between = how much similiarity.
 */
export const cosine_similarity = ( str1, str2 ) => {
	const l1 = string_to_lookup( str1 );
	const l2 = string_to_lookup( str2 );
	const denominator = lookup_to_magnitude( l1 ) * lookup_to_magnitude( l2 );
	if ( denominator === 0 ) {
		return 0;
	}
	return dot_product( l1, l2 ) / denominator;
};
export default cosine_similarity;
