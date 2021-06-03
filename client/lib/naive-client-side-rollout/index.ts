/**
 * Internal dependencies
 */
import user from 'calypso/lib/user';

/**
 * Hash function from:
 * https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
 *
 * Seems to work well enough.
 *
 * @param str The string to hash
 * @param seed  An optional seed.
 * @returns integer
 */
function cyrb53( str: string, seed = 0 ) {
	let h1 = 0xdeadbeef ^ seed;
	let h2 = 0x41c6ce57 ^ seed;

	for ( let i = 0, ch; i < str.length; i++ ) {
		ch = str.charCodeAt( i );
		h1 = Math.imul( h1 ^ ch, 2654435761 );
		h2 = Math.imul( h2 ^ ch, 1597334677 );
	}

	h1 = Math.imul( h1 ^ ( h1 >>> 16 ), 2246822507 ) ^ Math.imul( h2 ^ ( h2 >>> 13 ), 3266489909 );
	h2 = Math.imul( h2 ^ ( h2 >>> 16 ), 2246822507 ) ^ Math.imul( h1 ^ ( h1 >>> 13 ), 3266489909 );

	return 4294967296 * ( 2097151 & h2 ) + ( h1 >>> 0 );
}

/**
 * HIGHLY LIMITED! No waranty provided.
 *
 * It is bad because it doesn't work well for any conditions involving logged out users.
 * This can be fixed by storing the logged-out user assignment in local storage, which would make it not bad.
 *
 * Naively ship a feature to a percentage of our users.
 * - Works best for logged-in users.
 * - Uses randomisation for logged out users.
 * - Won't work across the log-in boundary.
 *
 * @param featureId The unique identifier of the feature being rolled out, not currently used but important for keeping track of the features.
 * @param percentage 0-100
 * @returns Boolean of whether the user should have the feature enabled, i.e. true = rolled out, false = not rolled out.
 */
export function badNaiveClientSideRollout( featureId: string, percentage: number ): boolean {
	const maybeUserId = user()?.get()?.ID;

	// zero-indexed buckets: 0-99
	let bucket;
	if ( maybeUserId ) {
		bucket = cyrb53( `${ featureId }${ maybeUserId }` ) % 100;
	} else {
		bucket = Math.random() * 100;
	}

	return bucket < percentage;
}
