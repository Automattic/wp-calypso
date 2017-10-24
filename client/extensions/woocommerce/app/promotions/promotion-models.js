/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CurrencyField from './fields/currency-field';
import PercentField from './fields/percent-field';
import TextField from './fields/text-field';
import AppliesToSingleProductField from './fields/applies-to-single-product-field';

/**
 * Field reused for all coupon promotion types.
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
 * Field reused for fixed currency-based coupons.
 */
const fixedDiscountField = {
	labelText: translate( 'Discount', { context: 'noun' } ),
	component: CurrencyField,
	isRequired: true,
};

/**
 * Promotion Type: Product Sale (e.g. $5 off the "I <3 Robots" t-shirt)
 */
const productSaleModel = {
	salePrice: {
		component: CurrencyField,
		labelText: translate( 'Product Sale Price' ),
		isRequired: true,
	},
	appliesTo: {
		component: AppliesToSingleProductField,
		labelText: translate( 'Applies to product' ),
		isRequired: true,
	},
};

/**
 * Promotion Type: Fixed Product Discount (e.g. $5 off any t-shirt)
 */
const fixedProductModel = {
	couponCode: couponCodeField,
	fixedDiscount: {
		...fixedDiscountField,
		labelText: translate( 'Product Discount', { context: 'noun' } )
	},
};

/**
 * Promotion Type: Fixed Cart Discount (e.g. $10 off my cart)
 */
const fixedCartModel = {
	couponCode: couponCodeField,
	fixedDiscount: {
		...fixedDiscountField,
		labelText: translate( 'Cart Discount', { context: 'noun' } ),
	},
};

/**
 * Promotion Type: Percentage Cart Discount (e.g. 10% off my cart)
 */
const percentCartModel = {
	couponCode: couponCodeField,
	percentDiscount: {
		component: PercentField,
		labelText: translate( 'Percent Cart Discount', { context: 'noun' } ),
		isRequired: true,
	},
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

