/**
 * External dependencies
 */
import { find } from 'lodash';

export function createPromotionFromProduct( product ) {
	const salePrice = product.sale_price;
	const startDate = product.date_on_sale_from || undefined;
	const endDate = product.date_on_sale_to || undefined;
	const productId = product.id;

	return {
		id: 'p' + product.id,
		name: product.name,
		type: 'product_sale',
		appliesTo: { productIds: [ product.id ] },
		salePrice,
		startDate,
		endDate,
		productId,
	};
}

export function createProductUpdateFromPromotion( promotion ) {
	const { productIds } = promotion.appliesTo || {};
	const id = productIds && productIds[ 0 ];

	if ( ! id ) {
		throw new Error( 'Cannot create product from promotion, product id not found.' );
	}

	return {
		id,
		sale_price: promotion.salePrice,
		date_on_sale_from: promotion.startDate,
		date_on_sale_to: promotion.endDate,
	};
}

export function createPromotionFromCoupon( coupon ) {
	const couponCode = coupon.code;
	const startDate = coupon.date_created;
	const endDate = coupon.date_expires || undefined;
	const individualUse = coupon.individual_use || undefined;
	const usageLimit = coupon.usage_limit || undefined;
	const usageLimitPerUser = coupon.usage_limit_per_user || undefined;
	const freeShipping = coupon.free_shipping || undefined;
	const minimumAmount = (
		( '0.00' !== coupon.minimum_amount ) ? coupon.minimum_amount : undefined
	);
	const maximumAmount = (
		( '0.00' !== coupon.maximum_amount ) ? coupon.maximum_amount : undefined
	);

	const promotion = {
		id: 'c' + coupon.id,
		name: coupon.code,
		type: coupon.discount_type,
		appliesTo: calculateCouponAppliesTo( coupon ),
		couponCode,
		startDate,
		endDate,
		individualUse,
		usageLimit,
		usageLimitPerUser,
		freeShipping,
		minimumAmount,
		maximumAmount,
		couponId: coupon.id,
	};

	switch ( coupon.discount_type ) {
		case 'percent':
			promotion.percentDiscount = coupon.amount;
			break;
		case 'fixed_cart':
		case 'fixed_product':
			promotion.fixedDiscount = coupon.amount;
			break;
	}

	return promotion;
}

export function createCouponUpdateFromPromotion( promotion ) {
	const { appliesTo } = promotion;

	if ( ! promotion.couponCode ) {
		throw new Error( 'Cannot create coupon from promotion with nonexistant couponCode' );
	}

	const amount = ( 'percent' === promotion.type
		? promotion.percentDiscount
		: promotion.fixedDiscount );

	const productIds = ( appliesTo && appliesTo.productIds ) || undefined;
	const productCategoryIds = ( appliesTo && appliesTo.productCategoryIds ) || undefined;

	return {
		id: promotion.couponId, // May not be present in case of create.
		discount_type: promotion.type,
		code: promotion.couponCode,
		amount: amount,
		date_expires: promotion.endDate,
		individual_use: promotion.individualUse,
		usage_limit: promotion.usageLimit,
		usage_limit_per_user: promotion.usageLimitPerUser,
		free_shipping: promotion.freeShipping,
		minimum_amount: promotion.minimumAmount,
		maximum_amount: promotion.maximumAmount,
		product_ids: productIds,
		product_categories: productCategoryIds,
	};
}

function calculateCouponAppliesTo( coupon ) {
	const { product_ids, product_categories } = coupon;

	// Assume all are selected unless we find something more specific.
	const appliesTo = { all: true };

	if ( product_ids && product_ids.length ) {
		appliesTo.productIds = product_ids;
		appliesTo.all = false;
	}

	if ( product_categories && product_categories.length ) {
		appliesTo.productCategoryIds = product_categories;
		appliesTo.all = false;
	}

	return appliesTo;
}

export function isCategoryExplicitlySelected( promotion, category ) {
	return Boolean( find( promotion.appliesTo.productCategoryIds, ( id ) => ( id === category.id ) ) );
}

export function isProductExplicitlySelected( promotion, product ) {
	return Boolean( find( promotion.appliesTo.productIds, ( id ) => ( id === product.id ) ) );
}

export function isCategorySelected( promotion, category ) {
	const { appliesTo } = promotion;

	if ( appliesTo.all ) {
		return true;
	}

	if ( isCategoryExplicitlySelected( promotion, category ) ) {
		return true;
	}

	return false;
}

export function isProductSelected( promotion, product ) {
	const { appliesTo } = promotion;

	if ( appliesTo.all ) {
		return true;
	}

	if ( isProductExplicitlySelected( promotion, product ) ) {
		return true;
	}

	if ( appliesTo.productCategoryIds ) {
		for ( const category of product.categories ) {
			if ( isCategoryExplicitlySelected( promotion, category ) ) {
				return true;
			}
		}
	}

	// Couldn't find anything that selected this product.
	return false;
}

