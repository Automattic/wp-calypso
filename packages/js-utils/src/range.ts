import toFinite from './to-finite';

/**
 * Creates an array of numbers progressing from `start` up to, but not
 * including, `end`. A `step` of `-1` is used if a negative `start` is specified
 * without an `end` or `step`. If `end` is not specified, it's set to `start`
 * with `start` then set to `0`. Bounds are coerced to finite numbers, matching
 * lodash.
 * @param start The start of the range (or the end, if `end` is omitted).
 * @param end   The end of the range (exclusive).
 * @param step  The value to increment or decrement by.
 * @returns The range of numbers.
 */
const range = ( start: number, end?: number, step?: number ): number[] => {
	start = toFinite( start );
	if ( end === undefined ) {
		end = start;
		start = 0;
	} else {
		end = toFinite( end );
	}
	if ( step === undefined ) {
		step = start < end ? 1 : -1;
	} else {
		step = toFinite( step );
	}

	let length = Math.max( Math.ceil( ( end - start ) / ( step || 1 ) ), 0 );
	const result = new Array< number >( length );

	let index = 0;
	while ( length-- ) {
		result[ index++ ] = start;
		start += step;
	}

	return result;
};

export default range;
