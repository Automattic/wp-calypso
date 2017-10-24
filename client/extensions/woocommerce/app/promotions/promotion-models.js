/**
 * External dependencies
 */
import { translate as moduleTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CurrencyField from './fields/currency-field';
import PercentField from './fields/percent-field';
import TextField from './fields/text-field';

export function createModels( translate ) {
	// -------------------------
	// Reusable Promotion Fields
	// -------------------------
	const couponCode = {
		component: TextField,
		labelText: translate( 'Coupon code' ),
		explanationText: translate(
			'Only apply this promotion when the customer supplies the coupon code'
		),
		placeholderText: translate( 'Enter coupon code' ),
		isRequired: true,
	};

	const fixedDiscount = {
		component: CurrencyField,
		isRequired: true,
	};

	// ---------------
	// Promotion types
	// ---------------
	const productSaleModel = {
		salePrice: {
			component: CurrencyField,
			labelText: translate( 'Product Sale Price' ),
			isRequired: true,
		},
	};

	const fixedProductModel = {
		couponCode,
		fixedDiscount: {
			...fixedDiscount,
			labelText: translate( 'Product Discount', { context: 'noun' } )
		},
	};

	const fixedCartModel = {
		couponCode,
		fixedDiscount: {
			...fixedDiscount,
			labelText: translate( 'Cart Discount', { context: 'noun' } ),
		},
	};

	const percentCartModel = {
		couponCode,
		percentDiscount: {
			component: PercentField,
			labelText: translate( 'Percent Cart Discount', { context: 'noun' } ),
			isRequired: true,
		},
	};

	// Master list of models by promotion type.
	return {
		[ 'product_sale' ]: productSaleModel,
		[ 'fixed_product' ]: fixedProductModel,
		[ 'fixed_cart' ]: fixedCartModel,
		[ 'percent' ]: percentCartModel,
	};
}

export default createModels( moduleTranslate );

