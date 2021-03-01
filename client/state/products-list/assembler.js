export const createProductObject = ( product ) => {
	product.cost = Number( product.cost );
	return product;
};
