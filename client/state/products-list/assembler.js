/** @format */

export const createProductObject = product => {
	product.cost = parseFloat( product.cost );
	return product;
};
