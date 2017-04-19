
/**
 * Gets product fetched from server.
 *
 * @param {Object} state Global state tree
 * @param {Number} productId Numeric product Id.
 * @return {Object} Product object from API.
 */
export function getProduct( state, productId ) {
	// TODO: Add fetched product data.
	return productId === 1 && { id: productId } || undefined;
}

