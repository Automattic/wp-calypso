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
 * gramsToLookup([ "_BEGIN_mi", "mis", "iss", "ssi", "sis", "iss", "ssi", "sip", "ipp", "ppi", "pi_END_" ]) =
 *     { "_BEGIN_mi": 1, "mis": 1, "iss": 2, "ssi": 2, "sis": 1, "sip": 1, "ipp": 1, "ppi": 1, "pi_END_": 1 }
 *
 * @param {string} gramList A list of trigrams, like [ "_BEGIN_He", "Hel", "ell", "llo", "lo_END_" ]
 * @returns {Object} A lookup table of trigram frequency.
 */
export function gramsToLookup( gramList ) {
	const lookup = {};
	for ( const gram of gramList ) {
		if ( gram in lookup ) {
			lookup[ gram ] += 1;
		} else {
			lookup[ gram ] = 1;
		}
	}
	return lookup;
}

/**
 * Convert a trigram lookup table into a real number magnitude, (aka l2 norm or
 * euclidean distance).  Think of each trigram lookup table as a vector, where
 * there are ~26 * 26 * 26 dimensions ("aaa" ... "zzz")
 *
 * Example:
 * lookupToMagnitude( gramsToLookup( trigrams( 'hi' ) ) ) = 1.414215... (sqrt of 2)
 *
 * @param {Object} lookup A lookup table of trigram frequency.
 * @returns {number} Magnitude of the vector
 */
export function lookupToMagnitude( lookup ) {
	if ( ! lookup || Object.keys( lookup ).length === 0 ) {
		return 0;
	}
	return Math.sqrt(
		Object.values( lookup )
			.map( ( x ) => x * x )
			.reduce( ( a, b ) => a + b )
	);
}

const stringToLookupCache = new LRU( {
	max: 5000,
} );

/**
 * Cached: Convert a string to a lookup table of trigram frequency.
 *
 * It's the same as calling gramsToLookup( trigrams( str ) ), but
 * it caches all calculations it does to find them again quickly.
 *
 * @param {string} str A string to convert to a lookup table of trigram frequency.
 * @returns {Object} lookup A lookup table of trigram frequency.
 */
function stringToLookup( str ) {
	const cacheAnswer = stringToLookupCache.get( str );
	if ( cacheAnswer !== undefined ) {
		return cacheAnswer;
	}

	const answer = gramsToLookup( trigrams( str ) );
	stringToLookupCache.set( str, answer );
	return answer;
}

/**
 * Finds the dot product of two lookup tables of trigram frequency.
 *
 * @param {Object} lookup1 Lookup table of trigram frequency.
 * @param {Object} lookup2 Lookup table of trigram frequency.
 * @returns {number} Dot product.
 */
function dotProduct( lookup1, lookup2 ) {
	let value = 0;
	for ( const key of Object.keys( lookup1 ) ) {
		if ( key in lookup2 ) {
			value += lookup1[ key ] * lookup2[ key ];
		}
	}
	return value;
}

/**
 * Finds the cosine similarity of two strings.
 *
 * Conceptually, convert each string to a lookup table of trigram frequencies.
 * Think of the lookup table as a vector in a ~26 * 26 * 26 dimensional space
 * ("aaa" ... "zzz"), then we measure the angle between the vectors, and take
 * the cosine of that angle.
 *
 * Note this does not do .toLowerCase to either string. You might want to if
 * you want case insensitive search.
 *
 * @param {str} str1 First string to compare
 * @param {str} str2 Second string to compare
 * @returns {number} Range 0-1. 1 = Exact same string, 0 = no similiarity.
 * In between = how much similiarity.
 */
export function cosineSimilarity( str1, str2 ) {
	const l1 = stringToLookup( str1 );
	const l2 = stringToLookup( str2 );
	const denominator = lookupToMagnitude( l1 ) * lookupToMagnitude( l2 );
	if ( denominator === 0 ) {
		return 0;
	}
	return dotProduct( l1, l2 ) / denominator;
}
export default cosineSimilarity;
