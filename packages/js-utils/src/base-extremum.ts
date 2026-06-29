/**
 * Shared core for `maxBy`/`minBy`. Returns the element of `array` whose
 * `iteratee` value is "best" per `isBetter`. Iteratee values are compared
 * **numerically** (the supported subset of lodash, which is how every call site
 * ranks); nullish and `NaN` values are skipped, and `undefined` is returned for
 * a nullish/empty array. Internal helper; not part of the public API.
 * @param array    The array to iterate over.
 * @param iteratee Invoked per element to produce the value to compare.
 * @param isBetter Whether `current` should replace the running `computed` best.
 */
const baseExtremum = < T >(
	array: readonly T[] | null | undefined,
	iteratee: ( value: T ) => number | null | undefined,
	isBetter: ( current: number, computed: number ) => boolean
): T | undefined => {
	let result: T | undefined;
	let computed: number | undefined;

	if ( array != null ) {
		for ( const value of array ) {
			const current = iteratee( value );
			if (
				current != null &&
				( computed === undefined ? ! Number.isNaN( current ) : isBetter( current, computed ) )
			) {
				computed = current;
				result = value;
			}
		}
	}

	return result;
};

export default baseExtremum;
