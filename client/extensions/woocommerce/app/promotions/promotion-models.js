
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

const fixedCouponModel = {
	fields: [
		'couponCode',
		'fixedDiscount',
		'endDate',
		'individualUse',
		'usageLimit',
		'usageLimitPerUser',
		'minimumAmount',
		'maximumAmount',
	],
	requiredFields: [
		'couponCode',
		'fixedDiscount',
	],
	canApplyTo: { all: true, categories: 'many', products: 'many' },
};

const percentCouponModel = {
	fields: [
		'couponCode',
		'percentDiscount',
		'endDate',
		'individualUse',
		'usageLimit',
		'usageLimitPerUser',
		'minimumAmount',
		'maximumAmount',
	],
	requiredFields: [
		'couponCode',
		'percentDiscount',
	],
	canApplyTo: { all: true, categories: 'many', products: 'many' },
};

export default {
	[ 'product_sale' ]: productModel,
	[ 'fixed_product' ]: fixedCouponModel,
	[ 'fixed_cart' ]: fixedCouponModel,
	[ 'percent' ]: percentCouponModel,
};
