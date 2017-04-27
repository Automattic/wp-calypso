
/**
 * Gets product fetched from server.
 *
 * @param {Object} state Global state tree
 * @param {Number} productId Numeric product Id.
 * @return {Object} Product object from API.
 */
export function getProduct( state, productId ) {
	// TODO: Add fetched product data.
	switch ( productId ) {
		case 1:
			return { id: productId };
		case 2:
			return { id: productId, variations: [ 3 ] };
		default:
			undefined;
	}
}
