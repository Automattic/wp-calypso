
export function hasField( model, fieldName ) {
	return ( -1 < model.fields.indexOf( fieldName ) );
}

export function isRequiredField( model, fieldName ) {
	return ( -1 < model.requiredFields.indexOf( fieldName ) );
}

const productModel = {
	fields: [
		'salePrice',
		'startDate',
		'endDate',
	],
	requiredFields: [
		'salePrice',
	],
	canApplyTo: { products: 'one' },
};

const couponModel = {
	fields: [
		'couponCode',
		'amount',
		'endDate',
		'individualUse',
		'usageLimit',
		'usageLimitPerUser',
		'minimumAmount',
		'maximumAmount',
	],
	requiredFields: [
		'couponCode',
		'amount',
	],
	canApplyTo: { all: true, categories: 'many', products: 'many' },
};

export default {
	[ 'product_sale' ]: productModel,
	[ 'fixed_product' ]: couponModel,
	[ 'fixed_cart' ]: couponModel,
	[ 'percent' ]: couponModel,
};
