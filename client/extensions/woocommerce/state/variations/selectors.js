/**
 * Gets variation fetched from server.
 *
 * @param {Object} state Global state tree
 * @param {Number} productId Numeric product id.
 * @param {Number} variationId Numeric variation id.
 * @return {Object} Variation object from API.
 */
export function getVariation( state, productId, variationId ) {
	// TODO: Add fetched variations data.
	return productId && variationId === 3 && { id: variationId } || undefined;
}
