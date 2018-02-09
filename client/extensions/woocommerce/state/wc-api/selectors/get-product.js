/** @format */

export const getProduct = endpoints => ( productId, requirements ) => {
	const product = endpoints.products.getSingle( productId, requirements );
	return product;
};
