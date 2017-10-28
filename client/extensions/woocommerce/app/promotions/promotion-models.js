/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CurrencyField from './fields/currency-field';
import DateField from './fields/date-field';
import FormField from './fields/form-field';
import NumberField from './fields/number-field';
import PercentField from './fields/percent-field';
import TextField from './fields/text-field';
import PromotionAppliesToField from './fields/promotion-applies-to-field';

/**
 * "Coupon code" field reused for all coupon promotion types.
 */
const couponCodeField = {
	component: TextField,
	labelText: translate( 'Coupon code' ),
	explanationText: translate(
		'Only apply this promotion when the customer supplies the coupon code'
	),
	placeholderText: translate( 'Enter coupon code' ),
	isRequired: true,
};

/**
 * "Applies to" field reused for all coupon promotion types.
 */
const appliesToCouponField = {
	component: (
		<PromotionAppliesToField
			selectionTypes={ [
				{ labelText: translate( 'All Products' ), type: 'all' },
				{ labelText: translate( 'Specific Products' ), type: 'productIds' },
				{ labelText: translate( 'Product Categories' ), type: 'productCategoryIds' },
			] }
		/>
	),
	labelText: translate( 'Applies to' ),
	isRequired: true,
};

/**
 * Field reused for fixed currency-based coupons.
 */
const fixedDiscountField = {
	labelText: translate( 'Discount', { context: 'noun' } ),
	component: CurrencyField,
	isRequired: true,
};

/**
 * General purpose start date condition.
 */
const startDate = {
	component: DateField,
	labelText: translate( 'Start Date' ),
	isEnableable: true,
};

/**
 * General purpose end date condition.
 */
const endDate = {
	component: DateField,
	labelText: translate( 'End Date' ),
	isEnableable: true,
};

/**
 * Promotion Type: Product Sale (e.g. $5 off the "I <3 Robots" t-shirt)
 */
const productSaleModel = {
	productAndSalePrice: {
		labelText: translate( 'Product & Sale Price' ),
		fields: {
			salePrice: {
				component: CurrencyField,
				labelText: translate( 'Product Sale Price' ),
				isRequired: true,
			},
			appliesTo: {
				component: (
					<PromotionAppliesToField
						selectionTypes={ [ { type: 'productIds' } ] }
						singular={ true }
					/>
				),
				labelText: translate( 'Applies to product' ),
				isRequired: true,
			},
		}
	},
	conditions: {
		labelText: translate( 'Conditions', { context: 'noun' } ),
		fields: {
			startDate,
			endDate,
		}
	},
};

/**
 * Conditions for all coupon types.
 */
const couponConditions = {
	labelText: translate( 'Conditions', { context: 'noun' } ),
	fields: {
		endDate,
		minimumAmount: {
			component: CurrencyField,
			labelText: translate( 'Minimum spend to qualify' ),
			isEnableable: true,
			defaultValue: 10,
		},
		maximumAmount: {
			component: CurrencyField,
			labelText: translate( 'Maximum amount for applicable discount' ),
			isEnableable: true,
			defaultValue: 100,
		},
		usageLimit: {
			component: NumberField,
			labelText: translate( 'Limit total times used' ),
			isEnableable: true,
			defaultValue: 10,
			minValue: 0,
		},
		usageLimitPerUser: {
			component: NumberField,
			labelText: translate( 'Limit times each user can use' ),
			isEnableable: true,
			defaultValue: 1,
			minValue: 0,
		},
		individualUse: {
			component: FormField,
			labelText: translate( 'Cannot be used with other coupons' ),
			isEnableable: true,
			defaultValue: true,
		},
	},
};

/**
 * Promotion Type: Fixed Product Discount (e.g. $5 off any t-shirt)
 */
const fixedProductModel = {
	couponCodeAndDiscount: {
		labelText: translate( 'Coupon Code & Discount' ),
		fields: {
			couponCode: couponCodeField,
			fixedDiscount: {
				...fixedDiscountField,
				labelText: translate( 'Product Discount', { context: 'noun' } )
			},
			appliesTo: appliesToCouponField,
		},
	},
	conditions: couponConditions,
};

/**
 * Promotion Type: Fixed Cart Discount (e.g. $10 off my cart)
 */
const fixedCartModel = {
	couponCodeAndDiscount: {
		labelText: translate( 'Coupon Code & Discount' ),
		fields: {
			couponCode: couponCodeField,
			fixedDiscount: {
				...fixedDiscountField,
				labelText: translate( 'Cart Discount', { context: 'noun' } ),
			},
			appliesTo: appliesToCouponField,
		},
	},
	conditions: couponConditions,
};

/**
 * Promotion Type: Percentage Cart Discount (e.g. 10% off my cart)
 */
const percentCartModel = {
	couponCodeAndDiscount: {
		labelText: translate( 'Coupon Code & Discount' ),
		fields: {
			couponCode: couponCodeField,
			percentDiscount: {
				component: PercentField,
				labelText: translate( 'Percent Cart Discount', { context: 'noun' } ),
				isRequired: true,
			},
			appliesTo: appliesToCouponField,
		},
	},
	conditions: couponConditions,
};

/**
 * Master list of models by promotion type.
 *
 * Note: The keys of this object correspond with promotion.type
 */
export default {
	product_sale: productSaleModel,
	fixed_product: fixedProductModel,
	fixed_cart: fixedCartModel,
	percent: percentCartModel,
};

