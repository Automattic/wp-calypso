/**
 * External dependencies
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import sha256 from 'hash.js/lib/hash/sha/256';

/**
 * Hashes users' Personally Identifiable Information using SHA256
 *
 * @param data Data to be hashed
 * @returns SHA256 in hex string format
 */
export default function hashPii( data: string | number ): string {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return ( sha256() as any ).update( data.toString() ).digest( 'hex' );
}
