/**
 * External dependencies
 */
import { find, uniqueId } from 'lodash';

export function createPromotionFromProduct( product ) {
	return {
		id: uniqueId( 'promotion:' ),
		name: product.name,
		type: 'product_sale',
		appliesTo: { productIds: [ product.id ] },
		salePrice: product.sale_price,
		startDate: product.date_on_sale_from_gmt,
		endDate: product.date_on_sale_to_gmt,
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
		date_on_sale_from_gmt: promotion.startDate,
		date_on_sale_to_gmt: promotion.endDate,
	};
}

export function createPromotionFromCoupon( coupon ) {
	const promotion = {
		id: uniqueId( 'promotion:' ),
		name: coupon.code,
		type: coupon.discount_type,
		appliesTo: calculateCouponAppliesTo( coupon ),
		couponCode: coupon.code,
		startDate: coupon.date_created_gmt,
		endDate: coupon.date_expires_gmt,
		individualUse: coupon.individual_use,
		usageLimit: coupon.usage_limit,
		usageLimitPerUser: coupon.usage_limit_per_user,
		freeShipping: coupon.free_shipping,
		minimumAmount: coupon.minimum_amount,
		maximumAmount: coupon.maximum_amount,
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
		date_expires_gmt: promotion.endDate,
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

