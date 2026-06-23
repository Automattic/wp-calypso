import baseExtremum from './base-extremum';

/**
 * Returns the element of `array` with the minimum `iteratee` value. Iteratee
 * values are compared numerically (the supported subset of lodash `minBy`);
 * nullish/`NaN` values are skipped, and `undefined` is returned for a nullish or
 * empty array.
 * @param array    The array to iterate over.
 * @param iteratee Invoked per element to produce the value to rank by.
 * @returns The element with the minimum value, or `undefined`.
 */
const minBy = < T >(
	array: readonly T[] | null | undefined,
	iteratee: ( value: T ) => number | null | undefined
): T | undefined => baseExtremum( array, iteratee, ( current, computed ) => current < computed );

export default minBy;
