/**
 * Converts the `cost` of a product to a Number, if it isn't already.
 *
 * @param {Object} product A product object.
 * @returns A shallow copy of the original product, but with `cost` set to the
 * 	 equivalent numeric value.
 */
export const ensureNumericCost = ( product ) => ( {
	...product,
	cost: Number( product.cost ),
} );
