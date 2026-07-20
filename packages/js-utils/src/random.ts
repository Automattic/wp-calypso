import toFinite from './to-finite';

function random( floating?: boolean ): number;
function random( upper: number, floating?: boolean ): number;
function random( lower: number, upper: number, floating?: boolean ): number;

/**
 * Produces a random number between `lower` and `upper` (inclusive). An integer
 * is returned unless either bound is fractional or `floating` is `true`, in
 * which case a floating-point number is returned.
 *
 * If only one numeric argument is provided it is treated as the upper bound
 * (with `0` as the lower bound); with no numeric arguments a number between `0`
 * and `1` is returned. Bounds are coerced to finite numbers (numeric strings
 * work) and swapped when `lower` is greater than `upper`. A single boolean
 * argument, or a boolean in place of `upper`, is treated as `floating`.
 * @param lower The lower bound (or the upper bound, if `upper` is omitted).
 * @param upper The upper bound.
 * @param floating Whether to return a floating-point number.
 * @returns The random number.
 */
function random( lower?: number | boolean, upper?: number | boolean, floating?: boolean ): number {
	if ( floating === undefined ) {
		if ( typeof upper === 'boolean' ) {
			floating = upper;
			upper = undefined;
		} else if ( typeof lower === 'boolean' ) {
			floating = lower;
			lower = undefined;
		}
	}

	let low: number;
	let high: number;
	if ( lower === undefined && upper === undefined ) {
		low = 0;
		high = 1;
	} else if ( upper === undefined ) {
		low = 0;
		high = toFinite( lower );
	} else {
		low = toFinite( lower );
		high = toFinite( upper );
	}

	if ( low > high ) {
		[ low, high ] = [ high, low ];
	}

	if ( floating || low % 1 || high % 1 ) {
		const rand = Math.random();
		const epsilon = parseFloat( '1e-' + ( String( rand ).length - 1 ) );
		return Math.min( low + rand * ( high - low + epsilon ), high );
	}

	return low + Math.floor( Math.random() * ( high - low + 1 ) );
}

export default random;
