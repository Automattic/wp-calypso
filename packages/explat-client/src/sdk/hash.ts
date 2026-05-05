/**
 * FNV-1a 32-bit hash over JavaScript UTF-16 code units. Returns a uint32.
 *
 * `>>> 0` at the end coerces to unsigned 32-bit. The PHP port masks with
 * `& 0xFFFFFFFF` after each accumulation; the two are equivalent for our
 * inputs. Don't move the coercion or runtimes diverge.
 */
export function hashFnv32a( str: string ): number {
	let hval = 0x811c9dc5;
	const l = str.length;
	for ( let i = 0; i < l; i++ ) {
		hval ^= str.charCodeAt( i );
		hval += ( hval << 1 ) + ( hval << 4 ) + ( hval << 7 ) + ( hval << 8 ) + ( hval << 24 );
	}
	return hval >>> 0;
}

/**
 * Double FNV-1a hash. Float in [0, 1) with 4-decimal granularity.
 *
 * The outer FNV hashes the decimal-string form of the inner result —
 * `String(inner)` matches PHP's `(string) $inner` for non-negative ints.
 */
export function hash( seed: string, value: string ): number {
	const inner = hashFnv32a( seed + value );
	const outer = hashFnv32a( String( inner ) );
	return ( outer % 10000 ) / 10000;
}
