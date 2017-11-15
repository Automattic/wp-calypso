/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CheckboxField from './fields/checkbox-field';
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
 * "Free shipping" field, reused for all coupon prompotion types.
 */
const freeShippingField = {
	component: CheckboxField,
	labelText: translate( 'Free shipping' ),
	explanationText: translate(
		'This coupon also provides free shipping'
	),
};

/**
 * Coupon "Applies to" card.
 */
const appliesToCoupon = {
	labelText: translate( 'Applies to' ),
	cssClass: 'promotions__promotion-form-card-applies-to',
	fields: {
		appliesTo: {
			component: (
				<PromotionAppliesToField
					selectionTypes={ [
						{ labelText: translate( 'All Products' ), type: 'all' },
						{ labelText: translate( 'Specific Products' ), type: 'productIds' },
						{ labelText: translate( 'Product Categories' ), type: 'productCategoryIds' },
					] }
				/>
			),
			// TODO: Remove this text after variable products are supported.
			explanationText: translate(
				'Note: Variable products cannot be selected directly, ' +
				'only via Product Categories or All Products.'
			),
		},
	},
};

/**
 * Coupon "Applies when" card.
 */
const appliesWhenCoupon = {
	labelText: translate( 'Applies when' ),
	cssClass: 'promotions__promotion-form-card-applies-to',
	fields: {
		appliesTo: {
			component: (
				<PromotionAppliesToField
					selectionTypes={ [
						{
							labelText: translate( 'Any product is in the cart' ),
							type: 'all'
						},
						{
							labelText: translate( 'A specific product is in the cart' ),
							type: 'productIds'
						},
						{
							labelText: translate( 'A product from a specific category is in the cart' ),
							type: 'productCategoryIds'
						},
					] }
				/>
			),
			// TODO: Remove this text after variable products are supported.
			explanationText: translate(
				'Note: Variable products cannot be selected directly, ' +
				'only via Product Categories or All Products.'
			),
		},
	},
};

/**
 * Product sale "Applies to" card.
 */
const appliesToProductSale = {
	labelText: translate( 'Applies to product' ),
	cssClass: 'promotions__promotion-form-card-applies-to',
	fields: {
		appliesTo: {
			component: (
				<PromotionAppliesToField
					selectionTypes={ [ { type: 'productIds' } ] }
					singular={ true }
				/>
			),
			// TODO: Remove this text after variable products are supported.
			explanationText: translate(
				'Note: Variable products cannot be selected.'
			),
		},
	},
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
	appliesToProductSale,
	productAndSalePrice: {
		labelText: translate( 'Product & Sale Price' ),
		cssClass: 'promotions__promotion-form-card-primary',
		fields: {
			salePrice: {
				component: CurrencyField,
				labelText: translate( 'Product Sale Price' ),
				isRequired: true,
			},
		}
	},
	conditions: {
		labelText: translate( 'Conditions', { context: 'noun' } ),
		cssClass: 'promotions__promotion-form-card-conditions',
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
	cssClass: 'promotions__promotion-form-card-conditions',
	fields: {
		endDate,
		minimumAmount: {
			component: CurrencyField,
			labelText: translate( 'This promotion requires a minimum purchase' ),
			isEnableable: true,
		},
		maximumAmount: {
			component: CurrencyField,
			labelText: translate( 'Don\'t apply this promotion if the order value exceeds a specific amount' ),
			isEnableable: true,
		},
		usageLimit: {
			component: NumberField,
			labelText: translate( 'Limit number of times this promotion can be used in total' ),
			isEnableable: true,
			minValue: 0,
		},
		usageLimitPerUser: {
			component: NumberField,
			labelText: translate( 'Limit total times each customer can use this promotion' ),
			isEnableable: true,
			minValue: 0,
		},
		individualUse: {
			component: FormField,
			labelText: translate( 'Cannot be combined with any other coupon' ),
			isEnableable: true,
			defaultValue: true,
		},
	},
};

/**
 * Promotion Type: Fixed Product Discount (e.g. $5 off any t-shirt)
 */
const fixedProductModel = {
	appliesToCoupon,
	couponCodeAndDiscount: {
		labelText: translate( 'Coupon Code & Discount' ),
		cssClass: 'promotions__promotion-form-card-primary',
		fields: {
			couponCode: couponCodeField,
			fixedDiscount: {
				...fixedDiscountField,
				labelText: translate( 'Product Discount', { context: 'noun' } )
			},
			freeShipping: freeShippingField,
		},
	},
	conditions: couponConditions,
};

/**
 * Promotion Type: Fixed Cart Discount (e.g. $10 off my cart)
 */
const fixedCartModel = {
	appliesWhenCoupon,
	couponCodeAndDiscount: {
		labelText: translate( 'Coupon Code & Discount' ),
		cssClass: 'promotions__promotion-form-card-primary',
		fields: {
			couponCode: couponCodeField,
			fixedDiscount: {
				...fixedDiscountField,
				labelText: translate( 'Cart Discount', { context: 'noun' } ),
			},
			freeShipping: freeShippingField,
		},
	},
	conditions: couponConditions,
};

/**
 * Promotion Type: Percentage Cart Discount (e.g. 10% off my cart)
 */
const percentCartModel = {
	appliesWhenCoupon,
	couponCodeAndDiscount: {
		labelText: translate( 'Coupon Code & Discount' ),
		cssClass: 'promotions__promotion-form-card-primary',
		fields: {
			couponCode: couponCodeField,
			percentDiscount: {
				component: PercentField,
				labelText: translate( 'Percent Cart Discount', { context: 'noun' } ),
				isRequired: true,
			},
			freeShipping: freeShippingField,
		},
	},
	conditions: couponConditions,
};

const freeShippingModel = {
	appliesWhenCoupon,
	couponCode: {
		labelText: translate( 'Coupon' ),
		cssClass: 'promotions__promotion-form-card-primary',
		fields: {
			couponCode: couponCodeField,
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
	free_shipping: freeShippingModel,
};
