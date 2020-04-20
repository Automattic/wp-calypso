/**
 * External dependencies
 */
import sha256 from 'hash.js/lib/hash/sha/256';

/**
 * Hashes users' Personally Identifiable Information using SHA256
 *
 * @param {string|number} data Data to be hashed
 * @returns {string} SHA256 in hex string format
 */
export default function hashPii( data ) {
	return sha256().update( data.toString() ).digest( 'hex' );
}
