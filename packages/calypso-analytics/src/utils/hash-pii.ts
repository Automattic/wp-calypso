/**
 * External dependencies
 */
import { sha256 } from 'hash.js';

/**
 * Hashes users' Personally Identifiable Information using SHA256
 *
 * @param {string|number} data Data to be hashed
 * @returns {string} SHA256 in hex string format
 */
export default function hashPii( data: string | number ): string {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return ( sha256() as any ).update( data.toString() ).digest( 'hex' );
}
